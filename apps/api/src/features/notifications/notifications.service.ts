import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    identityId?: string;
  }) {
    return this.prisma.notification.create({ data: params });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('الإشعار غير موجود');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });
    if (!prefs) {
      prefs = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPrefsDto) {
    await this.getPreferences(userId);
    return this.prisma.notificationPreferences.update({
      where: { userId },
      data: dto,
    });
  }
}
