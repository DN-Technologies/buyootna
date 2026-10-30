import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdminReportsFilterDto } from '../../dto/admin-reports-filter.dto';
import { AdminReportUpdateDto } from '../../dto/admin-report-update.dto';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { deletedRowKeptUntil } from '../../../stories/stories.rules';
import { findOwnedIdentity } from '../users/admin-persona.util';

function dayBounds(daysAgo: number) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysAgo,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysAgo + 1,
  );
  return { start, end };
}

const DATE_FILTER_DAYS: Record<string, number | undefined> = {
  TODAY: 0,
  WEEK: 6,
  MONTH: 29,
  ALL: undefined,
};

const REPORT_INCLUDE = {
  reporterUser: true,
  reporterIdentity: {
    include: { individualData: true, companyData: true, officeData: true },
  },
  targetUser: true,
  targetIdentity: {
    include: { individualData: true, companyData: true, officeData: true },
  },
  assignedAdmin: true,
} satisfies Prisma.ReportInclude;

type ReportRow = Prisma.ReportGetPayload<{ include: typeof REPORT_INCLUDE }>;

function identityDisplayName(
  identity: ReportRow['reporterIdentity'],
  fallbackName: string | null,
): string {
  return (
    identity?.companyData?.name ||
    identity?.officeData?.name ||
    identity?.individualData?.name ||
    fallbackName ||
    'مستخدم بيوتنا'
  );
}

function toUserSummary(
  user: ReportRow['reporterUser'] | ReportRow['targetUser'],
  identity: ReportRow['reporterIdentity'] | ReportRow['targetIdentity'],
) {
  if (!user) return null;
  return {
    id: user.id,
    name: identityDisplayName(identity, user.name),
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl:
      identity?.companyData?.logoUrl ||
      identity?.officeData?.logoUrl ||
      identity?.individualData?.avatarUrl ||
      user.avatarUrl ||
      null,
  };
}

// What the report is about beyond the account, for the admin to see and
// for «حذف المحتوى وإيقاف الحساب» to remove
function reportContent(row: ReportRow) {
  const snapshot = (v: Prisma.JsonValue | null | undefined) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;
  if (row.targetType === 'PROPERTY' || row.targetPropertyId) {
    return {
      kind: 'PROPERTY' as const,
      id: row.targetPropertyId,
      snapshot: null,
    };
  }
  if (row.targetReviewId || row.targetReviewSnapshot) {
    return {
      kind: 'REVIEW' as const,
      id: row.targetReviewId,
      snapshot: snapshot(row.targetReviewSnapshot),
    };
  }
  if (row.targetStoryId || row.targetStorySnapshot) {
    return {
      kind: 'STORY' as const,
      id: row.targetStoryId,
      snapshot: snapshot(row.targetStorySnapshot),
    };
  }
  if (row.targetReelId || row.targetReelSnapshot) {
    return {
      kind: 'REEL' as const,
      id: row.targetReelId,
      snapshot: snapshot(row.targetReelSnapshot),
    };
  }
  return null;
}

function toRow(row: ReportRow) {
  return {
    id: row.id,
    reportNumber: `RP-${row.reportNumber}`,
    targetType: row.targetType,
    status: row.status,
    priority: row.priority,
    reason: row.reason,
    description: row.description,
    submittedBy: toUserSummary(row.reporterUser, row.reporterIdentity),
    against: toUserSummary(row.targetUser, row.targetIdentity),
    assignedAdmin: row.assignedAdmin
      ? { id: row.assignedAdmin.id, name: row.assignedAdmin.name || 'مشرف' }
      : null,
    content: reportContent(row),
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
  };
}

@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  async getReports(filters: AdminReportsFilterDto) {
    const {
      search,
      status = 'ALL',
      priority = 'ALL',
      targetType = 'ALL',
      targetRole = 'ALL',
      dateFilter = 'ALL',
      page = 1,
      limit = 10,
    } = filters;

    const where: Prisma.ReportWhereInput = {
      ...(status !== 'ALL' ? { status: status } : {}),
      ...(priority !== 'ALL' ? { priority: priority } : {}),
      ...(targetType !== 'ALL' ? { targetType: targetType } : {}),
      ...(targetRole !== 'ALL' ? { targetUser: { role: targetRole } } : {}),
    };

    const daysAgo = DATE_FILTER_DAYS[dateFilter];
    if (daysAgo !== undefined) {
      where.createdAt = { gte: dayBounds(daysAgo).start };
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { reason: { contains: q, mode: 'insensitive' } },
        { reporterUser: { name: { contains: q, mode: 'insensitive' } } },
        { reporterUser: { email: { contains: q, mode: 'insensitive' } } },
        { reporterUser: { phone: { contains: q, mode: 'insensitive' } } },
        { targetUser: { name: { contains: q, mode: 'insensitive' } } },
        { targetUser: { email: { contains: q, mode: 'insensitive' } } },
        { targetUser: { phone: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total, pending, resolved, dismissed] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: REPORT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      this.prisma.report.count({ where: { status: ReportStatus.DISMISSED } }),
    ]);

    return {
      data: rows.map(toRow),
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total: pending + resolved + dismissed,
        pending,
        resolved,
        dismissed,
      },
    };
  }

  async getReportById(id: string) {
    const row = await this.prisma.report.findUnique({
      where: { id },
      include: REPORT_INCLUDE,
    });
    if (!row) throw new NotFoundException('البلاغ غير موجود');
    return toRow(row);
  }

  async updateReport(
    id: string,
    dto: AdminReportUpdateDto,
    adminUserId: string,
  ) {
    const existing = await this.prisma.report.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('البلاغ غير موجود');

    const data: Prisma.ReportUpdateInput = {};
    if (dto.priority) data.priority = dto.priority;
    if (dto.status) {
      data.status = dto.status;
      data.resolvedAt = new Date();
      data.resolvedByAdmin = { connect: { id: adminUserId } };
    }
    if (dto.assignedAdminId !== undefined) {
      data.assignedAdmin = dto.assignedAdminId
        ? { connect: { id: dto.assignedAdminId } }
        : { disconnect: true };
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data,
      include: REPORT_INCLUDE,
    });

    if (dto.status) {
      await this.notifyReporterBestEffort(updated);
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action:
          dto.status === ReportStatus.RESOLVED
            ? 'REPORT_RESOLVED'
            : 'REPORT_DISMISSED',
        targetType: 'REPORT',
        targetId: id,
        targetUserId: updated.targetUserId ?? undefined,
      });
    }
    if (dto.assignedAdminId !== undefined) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'REPORT_ASSIGNED',
        targetType: 'REPORT',
        targetId: id,
        targetUserId: updated.targetUserId ?? undefined,
        metadata: { assignedAdminId: dto.assignedAdminId || null },
      });
    }
    if (dto.priority) {
      await this.auditLog.log({
        actorAdminId: adminUserId,
        action: 'REPORT_PRIORITY_CHANGED',
        targetType: 'REPORT',
        targetId: id,
        targetUserId: updated.targetUserId ?? undefined,
        metadata: { priority: dto.priority },
      });
    }

    return toRow(updated);
  }

  async resolveReports(ids: string[], adminUserId: string) {
    return this.bulkUpdateStatus(ids, ReportStatus.RESOLVED, adminUserId);
  }

  async dismissReports(ids: string[], adminUserId: string) {
    return this.bulkUpdateStatus(ids, ReportStatus.DISMISSED, adminUserId);
  }

  private async bulkUpdateStatus(
    ids: string[],
    status: ReportStatus,
    adminUserId: string,
  ) {
    const updatedIds: string[] = [];
    const failedIds: string[] = [];

    for (const id of ids) {
      try {
        const updated = await this.prisma.report.update({
          where: { id },
          data: {
            status,
            resolvedAt: new Date(),
            resolvedByAdmin: { connect: { id: adminUserId } },
          },
          include: REPORT_INCLUDE,
        });
        updatedIds.push(id);
        await this.notifyReporterBestEffort(updated);
        await this.auditLog.log({
          actorAdminId: adminUserId,
          action:
            status === ReportStatus.RESOLVED
              ? 'REPORT_RESOLVED'
              : 'REPORT_DISMISSED',
          targetType: 'REPORT',
          targetId: id,
          targetUserId: updated.targetUserId ?? undefined,
        });
      } catch (error) {
        this.logger.warn(`Failed to update report ${id}: ${error}`);
        failedIds.push(id);
      }
    }

    const label = status === ReportStatus.RESOLVED ? 'تم حلها' : 'تم رفضها';
    return {
      message: `تم تغيير حالة ${updatedIds.length} بلاغ الى "${label}".`,
      updatedCount: updatedIds.length,
      updatedIds,
      failedIds,
    };
  }

  async getReportsForUser(userId: string, filters: AdminReportsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const identity = filters.identityId
      ? await findOwnedIdentity(this.prisma, userId, filters.identityId)
      : null;
    const where: Prisma.ReportWhereInput = {
      targetUserId: userId,
      ...(identity ? { targetIdentityId: identity.id } : {}),
      ...(filters.status && filters.status !== 'ALL'
        ? { status: filters.status }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: REPORT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: rows.map(toRow),
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getReportsForProperty(propertyId: string) {
    const rows = await this.prisma.report.findMany({
      where: { targetPropertyId: propertyId },
      include: REPORT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toRow);
  }

  async removeReportedProperty(
    propertyId: string,
    reason?: string,
    adminUserId?: string,
  ) {
    const existing = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { identity: { select: { userId: true } } },
    });

    await this.prisma.propertyDeletionLog.create({
      data: {
        propertyId,
        reason: reason || 'تم حذف الإعلان بواسطة الإدارة بسبب بلاغ',
      },
    });
    await this.prisma.property.delete({ where: { id: propertyId } });

    await this.auditLog.log({
      actorAdminId: adminUserId,
      action: 'PROPERTY_DELETED',
      targetType: 'PROPERTY',
      targetId: propertyId,
      targetUserId: existing?.identity?.userId,
      metadata: reason ? { reason } : undefined,
    });

    return { message: 'تم حذف الإعلان بنجاح' };
  }

  /**
   * The first half of «حذف المحتوى وإيقاف الحساب» (Guideline 1.2): removes
   * what the report is about (its listing, review or story; a report on an
   * account alone has nothing to remove) and returns the account to eject.
   * Something already gone is skipped.
   */
  async removeReportedContent(
    id: string,
    adminUserId: string,
    now = new Date(),
  ): Promise<{ targetUserId: string | null; removed: string | null }> {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('البلاغ غير موجود');
    const reason = `حذف بسبب البلاغ RP-${report.reportNumber}`;

    let removed: string | null = null;
    if (report.targetPropertyId) {
      const exists = await this.prisma.property.findUnique({
        where: { id: report.targetPropertyId },
        select: { id: true },
      });
      if (exists) {
        await this.removeReportedProperty(
          report.targetPropertyId,
          reason,
          adminUserId,
        );
        removed = 'PROPERTY';
      }
    } else if (report.targetReviewId) {
      const { count } = await this.prisma.review.deleteMany({
        where: { id: report.targetReviewId },
      });
      if (count > 0) {
        removed = 'REVIEW';
        await this.auditLog.log({
          actorAdminId: adminUserId,
          action: 'REVIEW_DELETED',
          targetType: 'REVIEW',
          targetId: report.targetReviewId,
          targetUserId: report.targetUserId ?? undefined,
          metadata: { reason },
        });
      }
    } else if (report.targetStoryId) {
      const story = await this.prisma.story.findUnique({
        where: { id: report.targetStoryId },
        select: { status: true, publishedAt: true },
      });
      if (story && (story.status === 'ACTIVE' || story.status === 'PENDING')) {
        // Leaves every read at once; the stories cleanup deletes its files
        await this.prisma.story.updateMany({
          where: {
            id: report.targetStoryId,
            status: { in: ['PENDING', 'ACTIVE'] },
          },
          data: {
            status: 'DELETED',
            deletedAt: now,
            expiresAt: deletedRowKeptUntil(story.publishedAt, now),
          },
        });
        removed = 'STORY';
        await this.auditLog.log({
          actorAdminId: adminUserId,
          action: 'STORY_REMOVED',
          targetType: 'STORY',
          targetId: report.targetStoryId,
          targetUserId: report.targetUserId ?? undefined,
          metadata: { reason },
        });
      }
    } else if (report.targetReelId) {
      // Leaves every read at once; the reels cleanup deletes its public files
      // within 10 minutes
      const { count } = await this.prisma.reel.updateMany({
        where: {
          id: report.targetReelId,
          status: { in: ['PENDING', 'ACTIVE'] },
        },
        data: { status: 'DELETED', deletedAt: now },
      });
      if (count > 0) {
        removed = 'REEL';
        await this.auditLog.log({
          actorAdminId: adminUserId,
          action: 'REEL_REMOVED',
          targetType: 'REEL',
          targetId: report.targetReelId,
          targetUserId: report.targetUserId ?? undefined,
          metadata: { reason },
        });
      }
    }
    return { targetUserId: report.targetUserId, removed };
  }

  async getAssignableAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return admins.map((a) => ({
      id: a.id,
      name: a.name || a.email || 'مشرف',
      email: a.email,
    }));
  }

  async getDashboardReportStats() {
    const newReportsCount = await this.prisma.report.count({
      where: {
        status: ReportStatus.PENDING,
        createdAt: { gte: dayBounds(0).start },
      },
    });
    return { newReportsCount };
  }

  private async notifyReporterBestEffort(report: ReportRow): Promise<void> {
    try {
      await this.notificationsService.create({
        userId: report.reporterUserId,
        type:
          report.status === ReportStatus.RESOLVED
            ? 'REPORT_RESOLVED'
            : 'REPORT_DISMISSED',
        title:
          report.status === ReportStatus.RESOLVED
            ? 'تم حل بلاغك'
            : 'تم إغلاق بلاغك',
        body: `تم تحديث حالة البلاغ رقم RP-${report.reportNumber} إلى "${
          report.status === ReportStatus.RESOLVED ? 'تم الحل' : 'مرفوض'
        }".`,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to notify reporter for report ${report.id}: ${error}`,
      );
    }
  }
}
