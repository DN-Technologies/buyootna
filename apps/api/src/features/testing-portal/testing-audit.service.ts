import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface TestingAuditEntry {
  actorName: string;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}

/** Who did what on the testing portal; never fails the action itself. */
@Injectable()
export class TestingAuditService {
  private readonly logger = new Logger(TestingAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: TestingAuditEntry): Promise<void> {
    try {
      await this.prisma.testingAuditLog.create({
        data: {
          actorName: entry.actorName,
          action: entry.action,
          target: entry.target ?? null,
          metadata: entry.metadata as Prisma.InputJsonValue,
          ip: entry.ip ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to write testing audit entry: ${String(error)}`);
    }
  }

  async list(page = 1, limit = 30) {
    const [rows, total] = await Promise.all([
      this.prisma.testingAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.testingAuditLog.count(),
    ]);
    return {
      data: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}
