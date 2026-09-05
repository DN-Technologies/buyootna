import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Session } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDevices(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActive: 'desc' },
    });
  }

  async revokeDevice(userId: string, id: string): Promise<{ count: number }> {
    return this.prisma.session.deleteMany({
      where: { id, userId },
    });
  }

  async revokeAllExceptCurrent(
    userId: string,
    currentSessionId?: string,
  ): Promise<{ count: number }> {
    if (currentSessionId) {
      return this.prisma.session.deleteMany({
        where: { userId, id: { not: currentSessionId } },
      });
    }

    // Old token issued before the sid claim existed — fall back to the
    // previous "most recently active" heuristic.
    const latest = await this.prisma.session.findFirst({
      where: { userId, isActive: true },
      orderBy: { lastActive: 'desc' },
    });

    if (latest) {
      return this.prisma.session.deleteMany({
        where: {
          userId,
          id: { not: latest.id },
        },
      });
    }

    return { count: 0 };
  }
}
