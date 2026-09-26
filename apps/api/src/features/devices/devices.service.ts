import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Session } from '@prisma/client';
import { SessionsService } from './sessions.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
  ) {}

  // pushToken is a delivery credential for that device -- never sent back
  async getDevices(userId: string): Promise<Omit<Session, 'pushToken'>[]> {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActive: 'desc' },
      omit: { pushToken: true },
    });
  }

  /** Stores (or clears) the push token on the caller's own session. */
  async setPushToken(
    userId: string,
    sessionId: string | undefined,
    token: string | null,
  ): Promise<{ success: boolean }> {
    if (!sessionId) {
      // Tokens issued before sessions existed carry no sid to attach to
      throw new BadRequestException('يرجى تسجيل الدخول مرة أخرى');
    }
    // A token belongs to one device: drop it from any other session first
    // (e.g. the same phone signed into a different account before)
    if (token) {
      await this.prisma.session.updateMany({
        where: { pushToken: token, NOT: { id: sessionId } },
        data: { pushToken: null },
      });
    }
    const { count } = await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { pushToken: token },
    });
    return { success: count > 0 };
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
