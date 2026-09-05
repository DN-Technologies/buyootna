import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Session } from '@prisma/client';
import { SessionsService } from './sessions.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
  ) {}

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
    return this.sessions.deleteAllExceptCurrent(userId, currentSessionId);
  }
}
