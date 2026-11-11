import { Injectable } from '@nestjs/common';
import {
  DiscountPurpose,
  DiscountType,
  PlanAudience,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isSlotUsable } from './plan-slots.rules';

export interface PublishOption {
  type: string;
  slotId: string;
  title: string;
  subtitle: string;
  planName: string;
  color: string;
  adsRemaining: number;
  durationDays: number;
  maxImagesPerAd: number;
  featuredDays: number;
  prioritySearch: boolean;
}

export interface PublishOptionsResponse {
  canPublish: boolean;
  options: PublishOption[];
}

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The plans sold to individuals (default; what older apps get) or to
   * offices. Only plans with something to buy are listed: an office's
   * «اعلان مميز» plan only carries featured ads' benefits.
   */
  async findAll(audience: PlanAudience = PlanAudience.INDIVIDUAL) {
    return this.prisma.plan.findMany({
      where: {
        isActive: true,
        audience,
        ...(audience === PlanAudience.OFFICE
          ? { packages: { some: { isActive: true } } }
          : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            adsCount: true,
            featuredAdsCount: true,
            validityMonths: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * The code advertised at the top of «الباقات»: flagged «إظهار في صفحة
   * الباقات» by an admin, and only while anyone could still use it (active,
   * started, not expired or used up, for this purpose). Newest first; null
   * when there's none.
   */
  async getPromo(
    purpose: DiscountPurpose = DiscountPurpose.PLAN,
    now = new Date(),
  ): Promise<{ code: string; type: DiscountType; value: number } | null> {
    const candidates = await this.prisma.discountCode.findMany({
      where: {
        showOnPlans: true,
        isActive: true,
        appliesTo: { has: purpose },
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        code: true,
        type: true,
        value: true,
        maxUses: true,
        usedCount: true,
      },
    });
    const usable = candidates.find(
      (c) => c.maxUses === null || c.usedCount < c.maxUses,
    );
    return usable
      ? { code: usable.code, type: usable.type, value: usable.value }
      : null;
  }

  /** One persona's wallet: its own credits and its own free ad. */
  async getWallet(identityId: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      select: { freeAdsRemaining: true },
    });
    return this.buildWallet({ identityId }, identity?.freeAdsRemaining ?? 0);
  }

  /** Every persona of an account together (the admin's view of a user). */
  async getAccountWallet(userId: string) {
    const free = await this.prisma.identity.aggregate({
      where: { userId },
      _sum: { freeAdsRemaining: true },
    });
    return this.buildWallet(
      { identity: { userId } },
      free._sum.freeAdsRemaining ?? 0,
    );
  }

  private async buildWallet(
    slotsWhere: Prisma.UserPlanSlotWhereInput,
    freeAdsRemaining: number,
  ) {
    const allSlots = await this.prisma.userPlanSlot.findMany({
      where: slotsWhere,
      include: {
        plan: true,
        invoice: {
          select: { planPackage: { select: { adsCount: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    // Expired credits (past «صلاحية انتهاء الباقة») can't be spent
    const activeSlots = allSlots.filter((s) => isSlotUsable(s, now));

    // Calculate balance counts by plan slug
    let gold = 0;
    let silver = 0;
    let regular = 0;

    activeSlots.forEach((s) => {
      const slug = s.plan.slug.toLowerCase();
      if (slug.includes('gold') || slug.includes('ذهبي')) {
        gold += s.adsRemaining;
      } else if (slug.includes('silver') || slug.includes('فضي')) {
        silver += s.adsRemaining;
      } else {
        regular += s.adsRemaining;
      }
    });

    const formattedHistory = allSlots.map((s) => {
      const shortId = s.id.replace(/-/g, '').slice(0, 8).toUpperCase();
      const isActive = isSlotUsable(s, now);

      // A bundle's own validity, else the plan's ad duration as before
      const expiryDate = s.expiresAt
        ? new Date(s.expiresAt)
        : new Date(s.createdAt);
      if (!s.expiresAt) {
        expiryDate.setDate(expiryDate.getDate() + (s.plan.durationDays || 30));
      }
      const formattedExpiry = expiryDate.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return {
        id: s.id,
        displayId: `ID:${shortId}`,
        planName: `الباقة ${s.plan.name}`,
        planSlug: s.plan.slug,
        status: isActive ? 'ACTIVE' : 'EXPIRED',
        dateText: isActive
          ? `تاريخ الانتهاء: ${formattedExpiry}`
          : `تاريخ الانتهاء: ${formattedExpiry}`,
        createdAt: s.createdAt,
        adsRemaining: s.adsRemaining,
      };
    });

    return {
      freeAdsRemaining,
      balanceCounts: {
        gold,
        silver,
        regular,
      },
      slots: activeSlots.map((s) => ({
        id: s.id,
        planId: s.planId,
        planName: s.plan.name,
        planSlug: s.plan.slug,
        color: s.plan.color,
        badge: s.plan.badge,
        adsRemaining: s.adsRemaining,
        maxActiveAds: s.plan.maxActiveAds,
        // Ads this slot started with: the purchased package's count, else the
        // plan's (legacy/admin-granted slots, where it can't be less than
        // what's still remaining).
        totalAds:
          s.invoice?.planPackage?.adsCount ??
          Math.max(s.plan.maxActiveAds, s.adsRemaining),
        // An office credit's «اعلان مميز» and when its unused ads are lost
        featured: s.plan.featuredDays > 0,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
      })),
      history: formattedHistory,
    };
  }

  async getPackageHistory(identityId: string) {
    const wallet = await this.getWallet(identityId);
    return wallet.history;
  }

  async getPublishOptions(identityId: string): Promise<PublishOptionsResponse> {
    const wallet = await this.getWallet(identityId);

    const options: PublishOption[] = [];

    // 1. Initial Free Sign-up Ad option if user has freeAdsRemaining > 0
    if (wallet.freeAdsRemaining > 0) {
      options.push({
        type: 'FREE_QUOTA',
        slotId: 'FREE_QUOTA',
        title: 'الإعلان المجاني الترحيبي',
        subtitle: `متبقي لديك ${wallet.freeAdsRemaining} إعلان مجاني`,
        planName: 'مجاني',
        color: '#018B1B',
        adsRemaining: wallet.freeAdsRemaining,
        durationDays: 10,
        maxImagesPerAd: 5,
        featuredDays: 0,
        prioritySearch: false,
      });
    }

    // 2. Purchased Plan Slots
    for (const slot of wallet.slots) {
      const fullSlot = await this.prisma.userPlanSlot.findUnique({
        where: { id: slot.id },
        include: { plan: true },
      });
      if (fullSlot) {
        const until = fullSlot.expiresAt
          ? ` · صالحة حتى ${fullSlot.expiresAt.toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`
          : '';
        options.push({
          type: 'PLAN_SLOT',
          slotId: fullSlot.id,
          // An office's featured credit reads «اعلان مميز», not «باقة …»
          title:
            fullSlot.plan.slug === 'office-featured'
              ? fullSlot.plan.name
              : `باقة ${fullSlot.plan.name}`,
          subtitle: `متبقي لديك ${fullSlot.adsRemaining} إعلان في هذه الباقة${until}`,
          planName: fullSlot.plan.name,
          color: fullSlot.plan.color || '#15304D',
          adsRemaining: fullSlot.adsRemaining,
          durationDays: fullSlot.plan.durationDays,
          maxImagesPerAd: fullSlot.plan.maxImagesPerAd,
          featuredDays: fullSlot.plan.featuredDays,
          prioritySearch: fullSlot.plan.prioritySearch,
        });
      }
    }

    return {
      canPublish: options.length > 0,
      options,
    };
  }
}
