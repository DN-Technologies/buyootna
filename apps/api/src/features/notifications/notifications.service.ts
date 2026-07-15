import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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
