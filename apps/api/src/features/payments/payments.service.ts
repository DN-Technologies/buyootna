import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface TapPhonePayload {
  country_code: string;
  number: string;
}

export interface TapChargeResponse {
  id?: string;
  status?: string;
  transaction?: {
    url?: string;
  };
  errors?: Array<{
    description?: string;
  }>;
  reference?: {
    transaction?: string;
    order?: string;
  };
}

@Injectable()
export class PaymentsService {
  private readonly tapSecretKey = process.env.TAP_SECRET_KEY;
  private readonly backendUrl =
    process.env.BACKEND_URL || 'https://api.buyootna.cloud';

  constructor(private readonly prisma: PrismaService) {}

  async createCharge(
    userId: string,
    planSlug: string,
    appRedirectUrl: string,
    sourceId = 'src_all',
  ) {
    if (!this.tapSecretKey) {
      throw new InternalServerErrorException(
        'Tap Secret Key is not configured on the server.',
      );
    }

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

    // 1. Create a PENDING invoice in our database
    const invoiceNo = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo,
        planName: plan.name,
        planDetails: `باقة ${plan.name} - ${plan.slug === 'gold' ? '4 إعلانات' : 'إعلان واحد'}`,
        amount: plan.price,
        status: 'PENDING',
        userId: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days due date
      },
    });

    // 2. If the plan is free (0 KWD), skip payment gateway
    if (plan.price === 0) {
      await this.prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID', paidAt: new Date() },
        });
        await tx.userPlanSlot.create({
          data: {
            userId,
            planId: plan.id,
            adsRemaining: plan.maxActiveAds,
            status: 'ACTIVE',
            invoiceId: invoice.id,
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: {
            activePlanId: plan.id,
          },
        });
      });
      return {
        checkoutUrl: null,
        invoiceId: invoice.id,
        status: 'PAID',
      };
    }

    // 3. Format phone number for Tap (Payee Requirements require Mobile)
    let phonePayload: TapPhonePayload = {
      country_code: '965',
      number: '90000000',
    };
    if (user.phone) {
      const cleanPhone = user.phone.replace(/[^0-9]/g, '');
      const number = cleanPhone.slice(-8); // extract last 8 digits
      const countryCode =
        cleanPhone.length > 8
          ? cleanPhone.slice(0, cleanPhone.length - 8)
          : '965';
      phonePayload = {
        country_code: countryCode.startsWith('+')
          ? countryCode.slice(1)
          : countryCode,
        number: number || '90000000',
      };
    }

    // 4. Construct Tap Charge API payload
    const tapPayload = {
      amount: plan.price,
      currency: 'KWD',
      threeDSecure: true,
      save_card: false,
      description: `اشتراك باقة ${plan.name} - Buyootna`,
      statement_descriptor: 'BUYOOTNA',
      metadata: {
        userId: user.id,
        planId: plan.id,
        invoiceId: invoice.id,
      },
      customer: {
        first_name: user.name
          ? user.name.replace(/[^\x20-\x7E]/g, '').trim() || 'Customer'
          : 'Customer',
        last_name: 'Buyootna',
        email: user.email || 'customer@buyootna.com',
        phone: phonePayload,
      },
      source: { id: sourceId },
      redirect: {
        url: `${this.backendUrl}/payments/redirect?invoiceId=${invoice.id}&appRedirectUrl=${encodeURIComponent(appRedirectUrl)}`,
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
      const response = await fetch('https://api.tap.company/v2/charges', {
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

  async verifyChargeAndRedirect(
    chargeId: string,
    invoiceId: string,
    appRedirectUrl: string,
  ): Promise<string> {
    if (!this.tapSecretKey) {
      throw new InternalServerErrorException(
        'Tap Secret Key is not configured.',
      );
    }

    console.log(
      '[Tap Verify] Verifying charge:',
      chargeId,
      'for invoice:',
      invoiceId,
    );

    try {
      const response = await fetch(
        `https://api.tap.company/v2/charges/${chargeId}`,
        {
          headers: {
            Authorization: `Bearer ${this.tapSecretKey}`,
          },
        },
      );

      const charge = (await response.json()) as TapChargeResponse;
      console.log(
        '[Tap Verify] Status:',
        response.status,
        'Charge:',
        JSON.stringify(charge, null, 2),
      );

      if (!response.ok || !charge) {
        console.error('[Tap Verify] Charge Error:', charge);
        return `${appRedirectUrl}?status=failed&invoiceId=${invoiceId}`;
      }

      const status = charge.status;

      if (status === 'CAPTURED') {
        await this.fulfillPayment(invoiceId);
        return `${appRedirectUrl}?status=success&invoiceId=${invoiceId}`;
      } else {
        return `${appRedirectUrl}?status=failed&invoiceId=${invoiceId}`;
      }
    } catch (error) {
      console.error('[Tap Verify] Exception:', error);
      return `${appRedirectUrl}?status=failed&invoiceId=${invoiceId}`;
    }
  }

  async handleWebhook(chargeBody: TapChargeResponse) {
    console.log(
      '[Tap Webhook] Received payload:',
      JSON.stringify(chargeBody, null, 2),
    );

    if (!chargeBody || !chargeBody.id) {
      return { success: false, message: 'Invalid payload' };
    }

    const status = chargeBody.status;
    const invoiceId = chargeBody.reference?.transaction;

    if (status === 'CAPTURED' && invoiceId) {
      await this.fulfillPayment(invoiceId);
      return { success: true, message: 'Payment fulfilled' };
    }

    return { success: true, message: 'Status ignored' };
  }

  async getInvoiceStatus(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new NotFoundException('الفاتورة غير موجودة');
    }

    return { status: invoice.status };
  }

  private async fulfillPayment(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.status === 'PAID') {
      return;
    }

    // Find matching Plan in DB
    const plan = await this.prisma.plan.findFirst({
      where: {
        OR: [
          { name: invoice.planName },
          { slug: invoice.planName.toLowerCase() },
          { name: { contains: invoice.planName } },
        ],
      },
    });

    const adsToAdd = plan ? plan.maxActiveAds : 1;

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark Invoice as PAID
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      // 2. Create UserPlanSlot in User's Wallet
      if (plan) {
        await tx.userPlanSlot.create({
          data: {
            userId: invoice.userId,
            planId: plan.id,
            adsRemaining: plan.maxActiveAds,
            status: 'ACTIVE',
            invoiceId: invoice.id,
          },
        });
      }

      // 3. Update User activePlanId
      if (plan) {
        await tx.user.update({
          where: { id: invoice.userId },
          data: {
            activePlanId: plan.id,
          },
        });
      }
    });

    console.log(
      `Payment Fulfilled: Invoice ${invoice.invoiceNo} paid, user ${invoice.userId} activated plan ${plan?.name || invoice.planName} with ${adsToAdd} ads.`,
    );
  }
}
