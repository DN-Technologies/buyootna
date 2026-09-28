import { Injectable, Logger } from '@nestjs/common';
import { AdminActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';

export interface AdminAuditLogParams {
  actorAdminId?: string;
  action: AdminActionType;
  targetType: string;
  targetId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminAuditLogService {
  private readonly logger = new Logger(AdminAuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Every call site treats this as fire-and-forget: a failure to write an
  // audit-log entry must never fail the admin action that triggered it, so
  // this swallows its own errors rather than making every caller wrap it in
  // its own try/catch.
  async log(params: AdminAuditLogParams): Promise<void> {
    try {
      await this.prisma.adminActionLog.create({
        data: {
          actorAdminId: params.actorAdminId,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          targetUserId: params.targetUserId,
          metadata: params.metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to write audit log entry: ${error}`);
    }
  }

  async getLogsForUser(targetUserId: string, page = 1, limit = 10) {
    const [rows, total] = await Promise.all([
      this.prisma.adminActionLog.findMany({
        where: { targetUserId },
        include: { actorAdmin: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.adminActionLog.count({ where: { targetUserId } }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        actorType: row.actorType,
        actorAdmin: row.actorAdmin
          ? { id: row.actorAdmin.id, name: row.actorAdmin.name || 'مشرف' }
          : null,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
      })),
      meta: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
