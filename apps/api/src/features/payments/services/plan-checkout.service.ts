import {
  BadRequestException,
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

const adsLabel = (ads: number) => (ads === 1 ? 'إعلان واحد' : `${ads} إعلانات`);

/** Buying a plan package (ads credited to the user's wallet). */
@Injectable()
export class PlanCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
    private readonly discounts: DiscountCodesService,
  ) {}

  /** The plan and package bought, and its price (from the database only). */
  private async resolve(planSlug: string, adsCount?: number | string) {
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
    return { plan, planPackage, amount, adsToGrant };
  }

  /** The payment screen's card and summary, with a code if given. */
  async quote(
    userId: string,
    planSlug: string,
    adsCount?: number | string,
    discountCode?: string,
  ): Promise<CheckoutQuote> {
    const { plan, amount, adsToGrant } = await this.resolve(planSlug, adsCount);
    const priced = await this.discounts.price(
      discountCode,
      'PLAN',
      amount,
      userId,
    );
    return {
      title: `الباقة ${plan.name}`,
      subtitle: adsLabel(adsToGrant),
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
    planSlug: string,
    appRedirectUrl: string,
    sourceId?: string,
    adsCount?: number | string,
    options: CheckoutOptions = {},
  ): Promise<ChargeResult> {
    this.tap.assertConfigured();
    const source = tapSourceFor(options.method, sourceId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { plan, planPackage, amount, adsToGrant } = await this.resolve(
      planSlug,
      adsCount,
    );
    const priced = await this.discounts.price(
      options.discountCode,
      'PLAN',
      amount,
      user.id,
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: plan.name,
        planDetails: `باقة ${plan.name} - ${adsLabel(adsToGrant)}`,
        ...invoiceAmountFields(priced),
        status: 'PENDING',
        userId: user.id,
        // The credits go to the persona that bought them
        identityId,
        planId: plan.id,
        planPackageId: planPackage?.id ?? null,
        dueDate: invoiceDueDate(),
      },
    });

    // A free plan (or a code covering the whole price) skips the gateway
    if (priced.total === 0) {
      await this.fulfillment.fulfill(invoice.id);
      return { checkoutUrl: null, invoiceId: invoice.id, status: 'PAID' };
    }

    return this.tap.createCharge({
      user,
      invoice,
      amount: priced.total,
      description: `اشتراك باقة ${plan.name} - Buyootna`,
      metadata: { planId: plan.id, planPackageId: planPackage?.id },
      appRedirectUrl,
      sourceId: source,
    });
  }
}
