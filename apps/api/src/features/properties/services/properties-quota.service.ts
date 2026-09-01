import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

export interface ResolvedPublishQuota {
  planSlotId: string | null;
  durationDays: number;
  maxImagesPerAd: number;
  featuredDays: number;
  prioritySearch: boolean;
}

@Injectable()
export class PropertiesQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePublishQuota(
    identityId: string,
    requestedSlotId: string | null | undefined,
    imagesCount: number,
    tx: Prisma.TransactionClient,
  ): Promise<ResolvedPublishQuota> {
    const identity = await tx.identity.findUnique({
      where: { id: identityId },
      select: { id: true, userId: true },
    });

    if (!identity) throw new NotFoundException('الهوية غير موجودة');

    // Check free ads remaining on user level (legacy)
    const user = await tx.user.findUnique({
      where: { id: identity.userId },
      select: { id: true, freeAdsRemaining: true },
    });

    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // 1. If explicit FREE_QUOTA or no slot specified and freeAdsRemaining > 0
    if (
      requestedSlotId === 'FREE_QUOTA' ||
      (!requestedSlotId && (user.freeAdsRemaining ?? 0) > 0)
    ) {
      if ((user.freeAdsRemaining ?? 0) <= 0) {
        throw new ForbiddenException(
          'لقد استنفذت الإعلان المجاني الترحيبي الخاص بك.',
        );
      }

      await tx.user.update({
        where: { id: identity.userId },
        data: { freeAdsRemaining: { decrement: 1 } },
      });

      return {
        planSlotId: null,
        durationDays: 10,
        maxImagesPerAd: 5,
        featuredDays: 0,
        prioritySearch: false,
      };
    }

    // 2. Specific Plan Slot requested OR auto-select single available slot
    let targetSlotId = requestedSlotId;

    if (!targetSlotId) {
      const activeSlots = await tx.userPlanSlot.findMany({
        where: { identityId, status: 'ACTIVE', adsRemaining: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSlots.length === 1) {
        targetSlotId = activeSlots[0].id;
      } else if (activeSlots.length === 0) {
        throw new ForbiddenException(
          'ليس لديك رصيد إعلانات نشط. يرجى شراء باقة إعلانات لنشر إعلان جديد.',
        );
      } else {
        throw new BadRequestException(
          'لديك أكثر من باقة في محفظتك. يرجى اختيار الباقة المراد النشر منها.',
        );
      }
    }

    const slot = await tx.userPlanSlot.findFirst({
      where: {
        id: targetSlotId,
        identityId,
        status: 'ACTIVE',
        adsRemaining: { gt: 0 },
      },
      include: { plan: true },
    });

    if (!slot) {
      throw new ForbiddenException(
        'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.',
      );
    }

    if (imagesCount > slot.plan.maxImagesPerAd) {
      throw new BadRequestException(
        `الباقة المحددة (${slot.plan.name}) تسمح بـ ${slot.plan.maxImagesPerAd} صور كحد أقصى لكل إعلان.`,
      );
    }

    const newAdsRemaining = slot.adsRemaining - 1;
    await tx.userPlanSlot.update({
      where: { id: slot.id },
      data: {
        adsRemaining: newAdsRemaining,
        status: newAdsRemaining <= 0 ? 'EXHAUSTED' : 'ACTIVE',
      },
    });

    return {
      planSlotId: slot.id,
      durationDays: slot.plan.durationDays,
      maxImagesPerAd: slot.plan.maxImagesPerAd,
      featuredDays: slot.plan.featuredDays,
      prioritySearch: slot.plan.prioritySearch,
    };
  }
}
