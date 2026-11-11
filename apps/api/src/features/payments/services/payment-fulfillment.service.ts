import { Injectable } from '@nestjs/common';
import { Invoice, PlanPackage, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { addMonths } from '../../company-subscriptions/company-subscription.rules';
import { slotExpiry } from '../../plans/plan-slots.rules';
import { DAY_MS } from '../payments.types';

/**
 * Grants whatever a paid invoice bought -- plan ads, a featured ad or a
 * company subscription period -- and
 * marks it PAID. Safe to call more than once for the same invoice (Tap's
 * redirect and webhook both arrive): only the call that flips the invoice
 * from unpaid to PAID grants anything.
 */
@Injectable()
export class PaymentFulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  async fulfill(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { planPackage: true },
    });

    if (!invoice || invoice.status === 'PAID') {
      return;
    }

    if (invoice.companyPlanId) {
      await this.fulfillSubscription(invoice);
    } else if (invoice.featurePackageId || invoice.propertyId) {
      await this.fulfillFeature(invoice);
    } else {
      await this.fulfillPlan(invoice);
    }
  }

  private async fulfillPlan(
    invoice: Invoice & { planPackage: PlanPackage | null },
  ) {
    // Invoices created before planId was recorded fall back to a name match
    const plan = invoice.planId
      ? await this.prisma.plan.findUnique({ where: { id: invoice.planId } })
      : await this.prisma.plan.findFirst({
          where: {
            OR: [
              { name: invoice.planName },
              { slug: invoice.planName.toLowerCase() },
              { name: { contains: invoice.planName } },
            ],
          },
        });

    const pkg = invoice.planPackage;
    const adsToAdd = pkg ? pkg.adsCount : plan ? plan.maxActiveAds : 1;
    // An office bundle's «3 اعلانات مميزة», credited under the featured plan
    const featuredToAdd = pkg?.featuredAdsCount ?? 0;
    const featuredPlanId = pkg?.featuredPlanId ?? plan?.id;
    // «صلاحية انتهاء الباقة»: from the purchase, the same for both credits
    const expiresAt = slotExpiry(pkg?.validityMonths, new Date());

    const fulfilled = await this.prisma.$transaction(async (tx) => {
      if (!(await this.markPaid(tx, invoice.id))) return false;
      await this.redeemDiscount(tx, invoice);

      // Add the ads to the buying persona's wallet; the account's
      // activePlan stays as the admin's plan label
      if (plan) {
        // A featured single ad has no regular ads: no empty credit for them
        if (adsToAdd > 0) {
          await tx.userPlanSlot.create({
            data: {
              identityId: invoice.identityId,
              userId: invoice.userId,
              planId: plan.id,
              adsRemaining: adsToAdd,
              status: 'ACTIVE',
              expiresAt,
              invoiceId: invoice.id,
            },
          });
        }
        if (featuredToAdd > 0 && featuredPlanId) {
          await tx.userPlanSlot.create({
            data: {
              identityId: invoice.identityId,
              userId: invoice.userId,
              planId: featuredPlanId,
              adsRemaining: featuredToAdd,
              status: 'ACTIVE',
              expiresAt,
              invoiceId: invoice.id,
            },
          });
        }
        if (invoice.userId) {
          await tx.user.update({
            where: { id: invoice.userId },
            data: { activePlanId: plan.id },
          });
        }
      }
      return true;
    });

    if (fulfilled) {
      console.log(
        `Payment Fulfilled: Invoice ${invoice.invoiceNo} paid, user ${invoice.userId} activated plan ${plan?.name || invoice.planName} with ${adsToAdd} ads and ${featuredToAdd} featured.`,
      );
    }
  }

  /**
   * Features the ad the invoice was for. Buying again while still featured
   * extends from the current end date instead of resetting it.
   */
  private async fulfillFeature(invoice: Invoice) {
    const days = invoice.featureDays ?? 0;
    const fulfilled = await this.prisma.$transaction(async (tx) => {
      if (!(await this.markPaid(tx, invoice.id))) return false;
      await this.redeemDiscount(tx, invoice);
      // The ad was deleted after paying: the paid invoice stays as a record
      if (!invoice.propertyId || days <= 0) return true;

      const property = await tx.property.findUnique({
        where: { id: invoice.propertyId },
        select: { featuredUntil: true },
      });
      if (!property) return true;

      const from = Math.max(Date.now(), property.featuredUntil?.getTime() ?? 0);
      await tx.property.update({
        where: { id: invoice.propertyId },
        data: {
          isFeatured: true,
          featuredUntil: new Date(from + days * DAY_MS),
        },
      });
      return true;
    });

    if (fulfilled) {
      console.log(
        `Payment Fulfilled: Invoice ${invoice.invoiceNo} featured property ${invoice.propertyId} for ${days} day(s).`,
      );
    }
  }

  /**
   * Adds the paid period to the company's subscription. It starts where the
   * company's current cover ends, so renewing early loses nothing.
   */
  private async fulfillSubscription(invoice: Invoice) {
    const plan = await this.prisma.companyPlan.findUnique({
      where: { id: invoice.companyPlanId! },
    });

    const fulfilled = await this.prisma.$transaction(async (tx) => {
      if (!(await this.markPaid(tx, invoice.id))) return false;
      await this.redeemDiscount(tx, invoice);
      // The plan was deleted after paying: the paid invoice stays as a record
      if (!plan) return true;

      const latest = await tx.companySubscription.findFirst({
        where: { identityId: invoice.identityId },
        orderBy: { endsAt: 'desc' },
        select: { endsAt: true },
      });
      const startsAt = new Date(
        Math.max(Date.now(), latest?.endsAt.getTime() ?? 0),
      );
      await tx.companySubscription.create({
        data: {
          identityId: invoice.identityId,
          kind: 'PAID',
          companyPlanId: plan.id,
          startsAt,
          endsAt: addMonths(startsAt, plan.durationMonths),
          invoiceId: invoice.id,
        },
      });
      return true;
    });

    if (fulfilled) {
      console.log(
        `Payment Fulfilled: Invoice ${invoice.invoiceNo} subscribed company ${invoice.identityId} to ${plan?.name ?? invoice.planDetails}.`,
      );
    }
  }

  /**
   * «كود الخصم»: its use is counted here, once the invoice is paid, so a
   * failed or abandoned payment never uses a code up. Runs inside the
   * transaction that marked the invoice PAID, which happens only once.
   */
  private async redeemDiscount(
    tx: Prisma.TransactionClient,
    invoice: Pick<Invoice, 'id' | 'userId' | 'discountCodeId'>,
  ) {
    if (!invoice.discountCodeId || !invoice.userId) return;
    await tx.discountRedemption.create({
      data: {
        codeId: invoice.discountCodeId,
        userId: invoice.userId,
        invoiceId: invoice.id,
      },
    });
    await tx.discountCode.update({
      where: { id: invoice.discountCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  /** Flips the invoice to PAID; false when another call already did. */
  private async markPaid(
    tx: Prisma.TransactionClient,
    invoiceId: string,
  ): Promise<boolean> {
    const { count } = await tx.invoice.updateMany({
      where: { id: invoiceId, status: { not: 'PAID' } },
      data: { status: 'PAID', paidAt: new Date() },
    });
    return count === 1;
  }
}
