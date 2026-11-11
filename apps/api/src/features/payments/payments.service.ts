import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  CheckoutOptions,
  CheckoutQuote,
  TapChargeResponse,
} from './payments.types';
import { FeatureCheckoutService } from './services/feature-checkout.service';
import { PaymentFulfillmentService } from './services/payment-fulfillment.service';
import { PlanCheckoutService } from './services/plan-checkout.service';
import { SubscriptionCheckoutService } from './services/subscription-checkout.service';
import { TapGatewayService } from './services/tap-gateway.service';

export type {
  PaymentPurpose,
  TapChargeResponse,
  TapPhonePayload,
} from './payments.types';

/**
 * Entry point for the payments controller. The work lives in ./services:
 * checkout per purchase type, the Tap gateway, and fulfillment.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
    private readonly planCheckout: PlanCheckoutService,
    private readonly featureCheckout: FeatureCheckoutService,
    private readonly subscriptionCheckout: SubscriptionCheckoutService,
  ) {}

  // --- CHECKOUT ---
  createCharge(
    userId: string,
    identityId: string,
    planSlug: string,
    appRedirectUrl: string,
    sourceId?: string,
    adsCount?: number | string,
    options?: CheckoutOptions,
  ) {
    return this.planCheckout.createCharge(
      userId,
      identityId,
      planSlug,
      appRedirectUrl,
      sourceId,
      adsCount,
      options,
    );
  }

  /** The payment screen's card and summary for any purchase, with a code. */
  quote(
    userId: string,
    identityId: string,
    body: {
      purpose?: string;
      planSlug?: string;
      adsCount?: number | string;
      packageId?: string;
      companyPlanId?: string;
      propertyId?: string;
      featurePackageId?: string;
      discountCode?: string;
    },
  ): Promise<CheckoutQuote> {
    switch (body.purpose) {
      case 'plan':
        if (!body.planSlug) {
          throw new BadRequestException('بيانات الطلب غير مكتملة');
        }
        return this.planCheckout.quote(
          userId,
          body.planSlug,
          body.adsCount,
          body.discountCode,
          body.packageId,
        );
      case 'subscription':
        return this.subscriptionCheckout.quote(
          userId,
          identityId,
          body.companyPlanId ?? '',
          body.discountCode,
        );
      case 'feature':
        return this.featureCheckout.quote(
          userId,
          identityId,
          body.propertyId ?? '',
          body.featurePackageId ?? '',
          body.discountCode,
        );
      default:
        throw new BadRequestException('نوع الشراء غير صالح');
    }
  }

  getFeaturePackages() {
    return this.featureCheckout.getPackages();
  }

  createFeatureCharge(
    userId: string,
    identityId: string,
    propertyId: string,
    featurePackageId: string,
    appRedirectUrl: string,
    sourceId?: string,
    options?: CheckoutOptions,
  ) {
    return this.featureCheckout.createCharge(
      userId,
      identityId,
      propertyId,
      featurePackageId,
      appRedirectUrl,
      sourceId,
      options,
    );
  }

  createSubscriptionCharge(
    userId: string,
    identityId: string,
    companyPlanId: string,
    appRedirectUrl: string,
    sourceId?: string,
    options?: CheckoutOptions,
  ) {
    return this.subscriptionCheckout.createCharge(
      userId,
      identityId,
      companyPlanId,
      appRedirectUrl,
      sourceId,
      options,
    );
  }

  // --- COMPLETION (Tap redirect + webhook) ---
  async verifyChargeAndRedirect(
    chargeId: string,
    invoiceId: string,
    appRedirectUrl: string,
    purpose?: string,
  ): Promise<string> {
    const result = (status: 'success' | 'failed') =>
      this.tap.appResultUrl(appRedirectUrl, status, invoiceId, purpose);

    try {
      if (!(await this.tap.isChargeCapturedFor(chargeId, invoiceId))) {
        return result('failed');
      }
      await this.fulfillment.fulfill(invoiceId);
      return result('success');
    } catch (error) {
      console.error('[Tap Verify] Exception:', error);
      return result('failed');
    }
  }

  /**
   * Tap's server-to-server callback. Its body is never trusted: the charge
   * is re-fetched from Tap and only fulfilled when Tap itself reports it
   * CAPTURED for this invoice -- otherwise anyone could POST
   * `{status: "CAPTURED"}` here and get an invoice marked paid.
   */
  async handleWebhook(chargeBody: TapChargeResponse) {
    const chargeId = chargeBody?.id;
    const invoiceId = chargeBody?.reference?.transaction;
    if (!chargeId || !invoiceId) {
      return { success: false, message: 'Invalid payload' };
    }

    if (!(await this.tap.isChargeCapturedFor(chargeId, invoiceId))) {
      return { success: true, message: 'Status ignored' };
    }

    await this.fulfillment.fulfill(invoiceId);
    return { success: true, message: 'Payment fulfilled' };
  }

  async getInvoiceStatus(userId: string, invoiceId: string) {
    // Any persona of the account may check (the app can switch persona
    // while a payment is being confirmed)
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, identity: { userId } },
      select: {
        status: true,
        planName: true,
        planDetails: true,
        companyPlanId: true,
        featurePackageId: true,
        propertyId: true,
        companySubscription: { select: { endsAt: true } },
        property: { select: { featuredUntil: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('الفاتورة غير موجودة');
    }

    // What the success popup says: what was bought and, when it has one,
    // when it ends (a subscription's period, a featured ad's end)
    const purpose = invoice.companyPlanId
      ? 'subscription'
      : invoice.featurePackageId || invoice.propertyId
        ? 'feature'
        : 'plan';
    const endsAt =
      purpose === 'subscription'
        ? (invoice.companySubscription?.endsAt ?? null)
        : purpose === 'feature'
          ? (invoice.property?.featuredUntil ?? null)
          : null;

    return {
      status: invoice.status,
      purpose,
      planName: invoice.planName,
      planDetails: invoice.planDetails,
      endsAt,
    };
  }
}
