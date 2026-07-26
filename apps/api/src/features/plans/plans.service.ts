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
    });
  }

  async getUserWallet(userId: string) {
    const slots = await this.prisma.userPlanSlot.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        adsRemaining: { gt: 0 },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { freeAdsRemaining: true },
    });

    return {
      freeAdsRemaining: user?.freeAdsRemaining ?? 0,
      slots: slots.map((s) => ({
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
    };
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
