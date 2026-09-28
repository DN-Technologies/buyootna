import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ChargeResult, invoiceDueDate, newInvoiceNo } from '../payments.types';
import { PaymentFulfillmentService } from './payment-fulfillment.service';
import { TapGatewayService } from './tap-gateway.service';

/** Paying to feature one of your ads ("تمييز الإعلان"). */
@Injectable()
export class FeatureCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tap: TapGatewayService,
    private readonly fulfillment: PaymentFulfillmentService,
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
  async createCharge(
    userId: string,
    identityId: string,
    propertyId: string,
    featurePackageId: string,
    appRedirectUrl: string,
    sourceId = 'src_all',
  ): Promise<ChargeResult> {
    if (!propertyId || !featurePackageId || !appRedirectUrl) {
      throw new BadRequestException('بيانات الطلب غير مكتملة');
    }
    this.tap.assertConfigured();

    const [user, property, featurePackage] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, identityId: true, status: true },
      }),
      this.prisma.featurePackage.findFirst({
        where: { id: featurePackageId, isActive: true },
      }),
    ]);

    if (!user) throw new NotFoundException('المستخدم غير موجود');
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

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo(),
        planName: 'تمييز الإعلان',
        planDetails: featurePackage.label,
        amount: featurePackage.price,
        status: 'PENDING',
        userId: user.id,
        identityId,
        featurePackageId: featurePackage.id,
        propertyId: property.id,
        featureDays: featurePackage.durationDays,
        dueDate: invoiceDueDate(),
      },
    });

    if (featurePackage.price === 0) {
      await this.fulfillment.fulfill(invoice.id);
      return { checkoutUrl: null, invoiceId: invoice.id, status: 'PAID' };
    }

    return this.tap.createCharge({
      user,
      invoice,
      amount: featurePackage.price,
      description: `${featurePackage.label} - Buyootna`,
      metadata: { featurePackageId: featurePackage.id, propertyId },
      appRedirectUrl,
      sourceId,
      purpose: 'feature',
    });
  }
}
