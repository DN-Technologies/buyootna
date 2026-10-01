import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

// The picked package (or free ad) can't be spent. The code tells the app
// to offer the packages still available rather than a dead-end error, and
// apart from other 403s such as a company still under review
function packageUnusable(message: string) {
  return new ForbiddenException({
    statusCode: 403,
    message,
    code: 'PACKAGE_UNUSABLE',
  });
}

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
      select: { id: true, freeAdsRemaining: true },
    });

    if (!identity) throw new NotFoundException('الهوية غير موجودة');

    // 1. The persona's welcome free ad: asked for explicitly, or used by
    //    default when no credit was picked and it's still there
    if (
      requestedSlotId === 'FREE_QUOTA' ||
      (!requestedSlotId && identity.freeAdsRemaining > 0)
    ) {
      // Conditional decrement: two publishes racing for the last free ad
      // can't both get it
      const { count } = await tx.identity.updateMany({
        where: { id: identityId, freeAdsRemaining: { gt: 0 } },
        data: { freeAdsRemaining: { decrement: 1 } },
      });
      if (count === 0) {
        throw packageUnusable('لقد استنفذت الإعلان المجاني الترحيبي الخاص بك.');
      }

      return {
        planSlotId: null,
        durationDays: 10,
        maxImagesPerAd: 5,
        featuredDays: 0,
        prioritySearch: false,
      };
    }

    // Credits belong to one persona: a company's credits can't be spent
    // by the same account's individual ads, and vice versa
    const ownedBy: Prisma.UserPlanSlotWhereInput = { identityId };

    // 2. Specific Plan Slot requested OR auto-select single available slot
    let targetSlotId = requestedSlotId;

    if (!targetSlotId) {
      const activeSlots = await tx.userPlanSlot.findMany({
        where: { ...ownedBy, status: 'ACTIVE', adsRemaining: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSlots.length === 1) {
        targetSlotId = activeSlots[0].id;
      } else if (activeSlots.length === 0) {
        throw packageUnusable(
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
        ...ownedBy,
        status: 'ACTIVE',
        adsRemaining: { gt: 0 },
      },
      include: { plan: true },
    });

    if (!slot) {
      throw packageUnusable(
        await this.unusableSlotMessage(identityId, targetSlotId, tx),
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

  // Says why a picked package can't be spent, so the user knows what to do
  // instead of a generic "invalid or empty"
  private async unusableSlotMessage(
    identityId: string,
    slotId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const [slot, identity] = await Promise.all([
      tx.userPlanSlot.findUnique({
        where: { id: slotId },
        select: {
          identityId: true,
          status: true,
          adsRemaining: true,
          identity: { select: { userId: true } },
        },
      }),
      tx.identity.findUnique({
        where: { id: identityId },
        select: { userId: true },
      }),
    ]);

    // Another account's slot reads as unknown: never confirm it exists
    if (!slot || !identity || slot.identity?.userId !== identity.userId) {
      return 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.';
    }
    if (slot.identityId !== identityId) {
      return 'هذه الباقة تابعة لحساب آخر لديك (فرد/شركة). بدّل الحساب للنشر منها.';
    }
    if (slot.status !== 'ACTIVE' || slot.adsRemaining <= 0) {
      return 'نفدت إعلانات هذه الباقة.';
    }
    return 'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.';
  }
}
