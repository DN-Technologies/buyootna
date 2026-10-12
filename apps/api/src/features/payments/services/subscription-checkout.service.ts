import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChargeResult, invoiceDueDate, newInvoiceNo } from '../payments.types';
import { PaymentFulfillmentService } from './payment-fulfillment.service';
import { TapGatewayService } from './tap-gateway.service';

/** A company paying for a subscription period (الباقات). */
@Injectable()
export class SubscriptionCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
  ) {}

  /**
   * The price comes from the CompanyPlan row, never from the client, and
   * only a company persona can subscribe.
   */
  async createCharge(
    userId: string,
    identityId: string,
    companyPlanId: string,
    appRedirectUrl: string,
    sourceId = 'src_all',
  ): Promise<ChargeResult> {
    if (!companyPlanId || !appRedirectUrl) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    this.tap.assertConfigured();

    const [user, identity, plan] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.identity.findUnique({
        where: { id: identityId },
        select: { type: true },
      }),
      this.prisma.companyPlan.findFirst({
        where: { id: companyPlanId, isActive: true },
      }),
    ]);

    if (!user) throw new NotFoundException('المستخدم غير موجود');
    if (identity?.type !== 'COMPANY') {
      throw new ForbiddenException('الاشتراكات متاحة لحسابات الشركات فقط');
    }
    if (!plan) throw new NotFoundException('الباقة غير موجودة أو غير نشطة');

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: 'اشتراك الشركات',
        planDetails: plan.name,
        amount: plan.price,
        status: 'PENDING',
        userId: user.id,
        identityId,
        companyPlanId: plan.id,
        dueDate: invoiceDueDate(),
      },
    });

    if (plan.price === 0) {
      await this.fulfillment.fulfill(invoice.id);
      return { checkoutUrl: null, invoiceId: invoice.id, status: 'PAID' };
    }

    return this.tap.createCharge({
      user,
      invoice,
      amount: plan.price,
      description: `${plan.name} - Buyootna`,
      metadata: { companyPlanId: plan.id },
      appRedirectUrl,
      sourceId,
      purpose: 'subscription',
    });
  }
}
