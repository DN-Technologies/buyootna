import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Session } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDevices(userId: string): Promise<Session[]> {
    let sessions = await this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActive: 'desc' },
    });

    if (sessions.length === 0) {
      // Create a default session representing the current device
      const defaultSession = await this.prisma.session.create({
        data: {
          userId,
          deviceName: 'جهاز الهاتف الحالي',
          isActive: true,
          location: 'الكويت',
        },
      });
      sessions = [defaultSession];
    }
    return sessions;
  }

  async revokeDevice(userId: string, id: string): Promise<{ count: number }> {
    return this.prisma.session.deleteMany({
      where: { id, userId },
    });
  }

  async revokeAllExceptCurrent(userId: string): Promise<{ count: number }> {
    // Find the latest active session to keep
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
