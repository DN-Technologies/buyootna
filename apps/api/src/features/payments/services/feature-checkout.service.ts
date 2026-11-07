import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
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

/** Paying to feature one of your ads ("تمييز الإعلان"). */
@Injectable()
export class FeatureCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
    private readonly discounts: DiscountCodesService,
  ) {}

  /** Active packages, in the admin's order. */
  getPackages() {
    return this.prisma.featurePackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { durationDays: 'asc' }],
      select: {
        id: true,
        label: true,
        description: true,
        durationDays: true,
        price: true,
      },
    });
  }

  /**
   * The price comes from the FeaturePackage row, never from the client, and
   * only the identity that owns an ACTIVE ad can feature it.
   */
  private async resolve(
    identityId: string,
    propertyId: string,
    featurePackageId: string,
  ) {
    if (!propertyId || !featurePackageId) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    const [property, featurePackage] = await Promise.all([
      this.prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, identityId: true, status: true },
      }),
      this.prisma.featurePackage.findFirst({
        where: { id: featurePackageId, isActive: true },
      }),
    ]);

    if (!property) throw new NotFoundException('العقار غير موجود');
    if (property.identityId !== identityId) {
      throw new ForbiddenException('لا تملك صلاحية تمييز هذا الإعلان');
    }
    if (property.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('يمكن تمييز الإعلانات المنشورة فقط');
    }
    if (!featurePackage) {
      throw new NotFoundException('باقة التمييز غير موجودة أو غير نشطة');
    }
    return { property, featurePackage };
  }

  async quote(
    userId: string,
    identityId: string,
    propertyId: string,
    featurePackageId: string,
    discountCode?: string,
  ): Promise<CheckoutQuote> {
    const { featurePackage } = await this.resolve(
      identityId,
      propertyId,
      featurePackageId,
    );
    const priced = await this.discounts.price(
      discountCode,
      'FEATURE',
      featurePackage.price,
      userId,
    );
    return {
      title: 'تمييز الإعلان',
      subtitle: featurePackage.label,
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
    propertyId: string,
    featurePackageId: string,
    appRedirectUrl: string,
    sourceId?: string,
    options: CheckoutOptions = {},
  ): Promise<ChargeResult> {
    if (!propertyId || !featurePackageId || !appRedirectUrl) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    this.tap.assertConfigured();
    const source = tapSourceFor(options.method, sourceId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    const { property, featurePackage } = await this.resolve(
      identityId,
      propertyId,
      featurePackageId,
    );
    const priced = await this.discounts.price(
      options.discountCode,
      'FEATURE',
      featurePackage.price,
      user.id,
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: 'تمييز الإعلان',
        planDetails: featurePackage.label,
        ...invoiceAmountFields(priced),
        status: 'PENDING',
        userId: user.id,
        identityId,
        featurePackageId: featurePackage.id,
        propertyId: property.id,
        featureDays: featurePackage.durationDays,
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
      description: `${featurePackage.label} - Buyootna`,
      metadata: { featurePackageId: featurePackage.id, propertyId },
      appRedirectUrl,
      sourceId: source,
      purpose: 'feature',
    });
  }
}
