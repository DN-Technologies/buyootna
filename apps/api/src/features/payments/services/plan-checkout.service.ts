import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChargeResult, invoiceDueDate, newInvoiceNo } from '../payments.types';
import { PaymentFulfillmentService } from './payment-fulfillment.service';
import { TapGatewayService } from './tap-gateway.service';

/** Buying a plan package (ads credited to the user's wallet). */
@Injectable()
export class PlanCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
  ) {}

  async createCharge(
    userId: string,
    planSlug: string,
    appRedirectUrl: string,
    sourceId = 'src_all',
    adsCount?: number | string,
  ): Promise<ChargeResult> {
    this.tap.assertConfigured();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { slug: planSlug, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('الباقة غير موجودة أو غير نشطة');
    }

    // The selected package (identified by its ad count) decides the price
    // and ads credited. Clients that predate packages send no adsCount and
    // buy the plan as a whole.
    let planPackage: { id: string; adsCount: number; price: number } | null =
      null;
    if (adsCount !== undefined && adsCount !== null) {
      const requestedAds = Number(adsCount);
      if (!Number.isInteger(requestedAds) || requestedAds <= 0) {
        throw new BadRequestException('عدد الإعلانات غير صالح');
      }
      planPackage = await this.prisma.planPackage.findFirst({
        where: { planId: plan.id, adsCount: requestedAds, isActive: true },
        select: { id: true, adsCount: true, price: true },
      });
      if (!planPackage) {
        throw new NotFoundException('خيار الباقة غير موجود أو غير نشط');
      }
    }
    const amount = planPackage ? planPackage.price : plan.price;
    const adsToGrant = planPackage ? planPackage.adsCount : plan.maxActiveAds;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: plan.name,
        planDetails: `باقة ${plan.name} - ${adsToGrant === 1 ? 'إعلان واحد' : `${adsToGrant} إعلانات`}`,
        amount,
        status: 'PENDING',
        userId: user.id,
        planId: plan.id,
        planPackageId: planPackage?.id ?? null,
        dueDate: invoiceDueDate(),
      },
    });

    // A free plan skips the payment gateway
    if (amount === 0) {
      await this.fulfillment.fulfill(invoice.id);
      return { checkoutUrl: null, invoiceId: invoice.id, status: 'PAID' };
    }

    return this.tap.createCharge({
      user,
      invoice,
      amount,
      description: `اشتراك باقة ${plan.name} - Buyootna`,
      metadata: { planId: plan.id, planPackageId: planPackage?.id },
      appRedirectUrl,
      sourceId,
    });
  }
}
