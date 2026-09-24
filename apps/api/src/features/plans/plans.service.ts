import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

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

  async findAll() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, adsCount: true, price: true },
        },
      },
    });
  }

  async getUserWallet(userId: string) {
    const allSlots = await this.prisma.userPlanSlot.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeSlots = allSlots.filter(
      (s) => s.status === 'ACTIVE' && s.adsRemaining > 0,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { freeAdsRemaining: true },
    });

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
      const isActive = s.status === 'ACTIVE' && s.adsRemaining > 0;

      const expiryDate = new Date(s.createdAt);
      expiryDate.setDate(expiryDate.getDate() + (s.plan.durationDays || 30));
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
      freeAdsRemaining: user?.freeAdsRemaining ?? 0,
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
        createdAt: s.createdAt,
      })),
      history: formattedHistory,
    };
  }

  async getPackageHistory(userId: string) {
    const wallet = await this.getUserWallet(userId);
    return wallet.history;
  }

  async getPublishOptions(userId: string): Promise<PublishOptionsResponse> {
    const wallet = await this.getUserWallet(userId);

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
        options.push({
          type: 'PLAN_SLOT',
          slotId: fullSlot.id,
          title: `باقة ${fullSlot.plan.name}`,
          subtitle: `متبقي لديك ${fullSlot.adsRemaining} إعلان في هذه الباقة`,
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
