import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminActionType } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminUpdatePlanDto } from '../../dto/admin-update-plan.dto';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

/**
 * The plans the app sells (العادية / الفضية / الذهبية): what the admin
 * Plans page shows and edits. Hiding a plan (isActive=false) stops it
 * being sold; existing credits from it keep working.
 */
@Injectable()
export class AdminPlanCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  /** Every plan, active or hidden, with how many times each was bought. */
  async list() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [plans, thisMonth] = await Promise.all([
      this.prisma.plan.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          packages: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { slots: true } },
        },
      }),
      this.prisma.userPlanSlot.groupBy({
        by: ['planId'],
        where: { createdAt: { gte: monthStart } },
        _count: { _all: true },
      }),
    ]);

    const monthCount = new Map(thisMonth.map((r) => [r.planId, r._count._all]));
    return plans.map(({ _count, ...plan }) => ({
      ...plan,
      subscriptionsCount: _count.slots,
      subscriptionsThisMonth: monthCount.get(plan.id) ?? 0,
    }));
  }

  async update(id: string, dto: AdminUpdatePlanDto, adminUserId: string) {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('الباقة غير موجودة');

    const updated = await this.prisma.plan.update({ where: { id }, data: dto });
    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: AdminActionType.PLAN_UPDATED,
      targetType: 'PLAN',
      targetId: id,
      metadata: {
        before: {
          name: existing.name,
          price: existing.price,
          isActive: existing.isActive,
          maxActiveAds: existing.maxActiveAds,
          durationDays: existing.durationDays,
          maxImagesPerAd: existing.maxImagesPerAd,
          featuredDays: existing.featuredDays,
          prioritySearch: existing.prioritySearch,
        },
        changes: { ...dto },
      },
    });
    return updated;
  }
}
