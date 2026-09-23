import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SlotStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PlansService } from '../../plans/plans.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AdminAuditLogService } from './admin-audit-log.service';
import { AdminChangePlanDto } from '../dto/admin-change-plan.dto';
import { AdminGrantExceptionalFeatureDto } from '../dto/admin-grant-exceptional-feature.dto';

@Injectable()
export class AdminPlansService {
  private readonly logger = new Logger(AdminPlansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  async getWallet(userId: string) {
    return this.plansService.getUserWallet(userId);
  }

  async changePlan(
    userId: string,
    dto: AdminChangePlanDto,
    adminUserId: string,
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });
    if (!plan) throw new NotFoundException('الباقة غير موجودة');

    const slot = await this.prisma.userPlanSlot.create({
      data: {
        planId: plan.id,
        userId,
        adsRemaining: dto.adsRemaining ?? plan.maxActiveAds,
        status: SlotStatus.ACTIVE,
      },
    });

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'PLAN_CHANGED',
      targetType: 'PLAN',
      targetId: slot.id,
      targetUserId: userId,
      metadata: { planId: plan.id, planName: plan.name },
    });

    return this.plansService.getUserWallet(userId);
  }

  async grantExceptionalFeature(
    userId: string,
    dto: AdminGrantExceptionalFeatureDto,
    adminUserId: string,
  ) {
    if (dto.adsCount) {
      const latestSlot = await this.prisma.userPlanSlot.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      const planId =
        latestSlot?.planId ??
        (
          await this.prisma.plan.findFirst({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          })
        )?.id;

      if (planId) {
        await this.prisma.userPlanSlot.create({
          data: {
            planId,
            userId,
            adsRemaining: dto.adsCount,
            status: SlotStatus.ACTIVE,
          },
        });
      }
    }

    if (dto.notifyEmail || dto.notifyApp) {
      await this.notifyUserBestEffort(userId);
    }

    // Visibility toggles/photo-count/expiry have no schema concept of a
    // per-user override -- they're recorded here as audit-log metadata
    // (visible in the Logs tab) rather than enforced anywhere.
    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'EXCEPTIONAL_FEATURE_GRANTED',
      targetType: 'PLAN',
      targetUserId: userId,
      metadata: {
        adsCount: dto.adsCount,
        photosCount: dto.photosCount,
        durationDays: dto.durationDays,
        priorityVisibility: dto.priorityVisibility,
        featuredResultsVisibility: dto.featuredResultsVisibility,
        expiryDate: dto.expiryDate,
      },
    });

    return { message: 'تم منح المميزات الاستثنائية بنجاح' };
  }

  private async notifyUserBestEffort(userId: string): Promise<void> {
    try {
      await this.notificationsService.create({
        userId,
        type: 'ADMIN_CUSTOM_MESSAGE',
        title: 'مميزات استثنائية',
        body: 'قامت الإدارة بمنح حسابك مميزات استثنائية.',
      });
    } catch (error) {
      this.logger.warn(`Failed to notify user ${userId}: ${error}`);
    }
  }
}
