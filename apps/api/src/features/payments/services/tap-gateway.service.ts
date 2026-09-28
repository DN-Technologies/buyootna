import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ChargeResult,
  PaymentPurpose,
  TapChargeResponse,
  TapPhonePayload,
} from '../payments.types';

const TAP_CHARGES_URL = 'https://api.tap.company/v2/charges';

export interface TapChargeRequest {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  invoice: { id: string; invoiceNo: string };
  amount: number;
  description: string;
  metadata: Record<string, string | undefined>;
  appRedirectUrl: string;
  sourceId: string;
  purpose?: PaymentPurpose;
}

/**
 * Everything that talks to Tap Payments: creating a checkout for a PENDING
 * invoice, and verifying a charge before anything is fulfilled.
 */
@Injectable()
export class TapGatewayService {
  private readonly tapSecretKey = process.env.TAP_SECRET_KEY;
  private readonly backendUrl =
    process.env.BACKEND_URL || 'https://api.buyootna.cloud';

  /** Fails fast, before an invoice is created, when Tap isn't set up. */
  assertConfigured() {
    if (!this.tapSecretKey) {
      throw new InternalServerErrorException(
        'Tap Secret Key is not configured on the server.',
      );
    }
  }

  /** Creates the Tap charge for a PENDING invoice and returns its checkout URL. */
  async createCharge({
    user,
    invoice,
    amount,
    description,
    metadata,
    appRedirectUrl,
    sourceId,
    purpose,
  }: TapChargeRequest): Promise<ChargeResult> {
    const tapPayload = {
      amount,
      currency: 'KWD',
      threeDSecure: true,
      save_card: false,
      description,
      statement_descriptor: 'BUYOOTNA',
      metadata: { ...metadata, userId: user.id, invoiceId: invoice.id },
      customer: {
        first_name: user.name
          ? user.name.replace(/[^\x20-\x7E]/g, '').trim() || 'Customer'
          : 'Customer',
        last_name: 'Buyootna',
        email: user.email || 'customer@buyootna.com',
        phone: this.phonePayload(user.phone),
      },
      source: { id: sourceId },
      redirect: {
        url: this.redirectUrl(invoice.id, appRedirectUrl, purpose),
      },
      post: {
        url: `${this.backendUrl}/payments/webhook`,
      },
      reference: {
        transaction: invoice.id,
        order: invoice.invoiceNo,
      },
    };

    console.log(
      '[Tap Charge] Key Prefix:',
      this.tapSecretKey ? `${this.tapSecretKey.substring(0, 7)}...` : 'MISSING',
    );
    console.log(
      '[Tap Charge] Creating charge with payload:',
      JSON.stringify(tapPayload, null, 2),
    );

    try {
      const response = await fetch(TAP_CHARGES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.tapSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tapPayload),
      });

      const responseData = (await response.json()) as TapChargeResponse;
      console.log('[Tap Charge] HTTP Status:', response.status);
      console.log(
        '[Tap Charge] Response Body:',
        JSON.stringify(responseData, null, 2),
      );

      if (!response.ok) {
        console.error('[Tap Charge] Error Response:', responseData);
        throw new BadRequestException(
          responseData?.errors?.[0]?.description ||
            'فشل في إنشاء عملية الدفع مع بوابة الدفع',
        );
      }

      console.log(
        '[Tap Charge] Created successfully. Checkout URL:',
        responseData.transaction?.url,
      );

      return {
        checkoutUrl: responseData.transaction?.url,
        invoiceId: invoice.id,
        status: 'PENDING',
      };
    } catch (error) {
      console.error('[Tap Charge] Exception:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'حدث خطأ أثناء الاتصال ببوابة الدفع Tap',
      );
    }
  }

  /**
   * True only when Tap itself reports this charge CAPTURED and the charge
   * was created for `invoiceId` (its reference.transaction). Nothing a
   * caller sends is trusted, and a captured charge for one invoice can't be
   * replayed to fulfil another.
   */
  async isChargeCapturedFor(
    chargeId: string,
    invoiceId: string,
  ): Promise<boolean> {
    this.assertConfigured();
    const response = await fetch(
      `${TAP_CHARGES_URL}/${encodeURIComponent(chargeId)}`,
      { headers: { Authorization: `Bearer ${this.tapSecretKey}` } },
    );
    if (!response.ok) {
      console.error('[Tap Verify] Charge lookup failed:', response.status);
      return false;
    }
    const charge = (await response.json()) as TapChargeResponse;
    const captured =
      charge?.status === 'CAPTURED' &&
      charge.reference?.transaction === invoiceId;
    if (!captured) {
      console.warn(
        `[Tap Verify] Charge ${chargeId} not captured for invoice ${invoiceId} (status ${charge?.status})`,
      );
    }
    return captured;
  }

  /** The app deep link Tap's checkout finally lands on, with the outcome. */
  appResultUrl(
    appRedirectUrl: string,
    status: 'success' | 'failed',
    invoiceId: string,
    purpose?: string,
  ) {
    const params = new URLSearchParams({ status, invoiceId });
    if (purpose === 'feature') params.set('purpose', 'feature');
    const separator = appRedirectUrl.includes('?') ? '&' : '?';
    return `${appRedirectUrl}${separator}${params.toString()}`;
  }

  private redirectUrl(
    invoiceId: string,
    appRedirectUrl: string,
    purpose?: PaymentPurpose,
  ) {
    const url = new URL(`${this.backendUrl}/payments/redirect`);
    url.searchParams.set('invoiceId', invoiceId);
    url.searchParams.set('appRedirectUrl', appRedirectUrl);
    if (purpose) url.searchParams.set('purpose', purpose);
    return url.toString();
  }

  // Tap requires a payer mobile number
  private phonePayload(phone: string | null): TapPhonePayload {
    if (!phone) return { country_code: '965', number: '90000000' };
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const number = cleanPhone.slice(-8); // extract last 8 digits
    const countryCode =
      cleanPhone.length > 8
        ? cleanPhone.slice(0, cleanPhone.length - 8)
        : '965';
    return {
      country_code: countryCode.startsWith('+')
        ? countryCode.slice(1)
        : countryCode,
      number: number || '90000000',
    };
  }
}
