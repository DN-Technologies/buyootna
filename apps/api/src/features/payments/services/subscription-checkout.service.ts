import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { enabledPaymentMethods, tapSourceFor } from '../payment-methods';
import {
  ChargeResult,
  CheckoutOptions,
  CheckoutQuote,
  invoiceDueDate,
  newInvoiceNo,
} from '../payments.types';
import {
  DiscountCodesService,
  invoiceAmountFields,
} from './discount-codes.service';
import { PaymentFulfillmentService } from './payment-fulfillment.service';
import { TapGatewayService } from './tap-gateway.service';

const monthsLabel = (months: number) =>
  `صالحة لمدة ${months === 1 ? 'شهر' : months === 2 ? 'شهرين' : `${months} أشهر`}`;

/** A company paying for a subscription period (الباقات). */
@Injectable()
export class SubscriptionCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
    private readonly discounts: DiscountCodesService,
  ) {}

  /**
   * The price comes from the CompanyPlan row, never from the client, and
   * only a company persona can subscribe.
   */
  private async resolve(identityId: string, companyPlanId: string) {
    if (!companyPlanId) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    const [identity, plan] = await Promise.all([
      this.prisma.identity.findUnique({
        where: { id: identityId },
        select: { type: true },
      }),
      this.prisma.companyPlan.findFirst({
        where: { id: companyPlanId, isActive: true },
      }),
    ]);
    if (identity?.type !== 'COMPANY') {
      throw new ForbiddenException('الاشتراكات متاحة لحسابات الشركات فقط');
    }
    if (!plan) throw new NotFoundException('الباقة غير موجودة أو غير نشطة');
    return plan;
  }

  async quote(
    userId: string,
    identityId: string,
    companyPlanId: string,
    discountCode?: string,
  ): Promise<CheckoutQuote> {
    const plan = await this.resolve(identityId, companyPlanId);
    const priced = await this.discounts.price(
      discountCode,
      'SUBSCRIPTION',
      plan.price,
      userId,
    );
    return {
      title: plan.name,
      subtitle: monthsLabel(plan.durationMonths),
      price: priced.price,
      discount: priced.discount,
      total: priced.total,
      currency: 'KWD',
      discountCode: priced.code,
      methods: enabledPaymentMethods(),
    };
  }

  async createCharge(
    userId: string,
    identityId: string,
    companyPlanId: string,
    appRedirectUrl: string,
    sourceId?: string,
    options: CheckoutOptions = {},
  ): Promise<ChargeResult> {
    if (!companyPlanId || !appRedirectUrl) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    this.tap.assertConfigured();
    const source = tapSourceFor(options.method, sourceId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    const plan = await this.resolve(identityId, companyPlanId);
    const priced = await this.discounts.price(
      options.discountCode,
      'SUBSCRIPTION',
      plan.price,
      user.id,
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: 'اشتراك الشركات',
        planDetails: plan.name,
        ...invoiceAmountFields(priced),
        status: 'PENDING',
        userId: user.id,
        identityId,
        companyPlanId: plan.id,
        dueDate: invoiceDueDate(),
      },
    });

    if (priced.total === 0) {
      await this.fulfillment.fulfill(invoice.id);
      return { checkoutUrl: null, invoiceId: invoice.id, status: 'PAID' };
    }

    return this.tap.createCharge({
      user,
      invoice,
      amount: priced.total,
      description: `${plan.name} - Buyootna`,
      metadata: { companyPlanId: plan.id },
      appRedirectUrl,
      sourceId: source,
      purpose: 'subscription',
    });
  }
}
