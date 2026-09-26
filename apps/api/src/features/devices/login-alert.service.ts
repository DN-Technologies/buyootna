import { Injectable, Logger } from '@nestjs/common';
import { Session } from '@prisma/client';
import { MailService } from '../../core/mail/mail.service';
import { newDeviceLoginTemplate } from '../../core/mail/templates/new-device-login.template';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const LOGIN_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kuwait',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * Security alert for a login from a device the account hasn't used before:
 * tells the account's other active devices (in-app notification) and the
 * owner's email. Security alerts are sent regardless of notification
 * preferences.
 */
@Injectable()
export class LoginAlertService {
  private readonly logger = new Logger(LoginAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  /** Never throws: an alert failure must not block or fail the login. */
  async notifyNewDeviceLogin(userId: string, newSession: Session) {
    try {
      await this.alert(userId, newSession);
    } catch (error) {
      this.logger.warn(`New-login alert failed for user ${userId}: ${error}`);
    }
  }

  private async alert(userId: string, newSession: Session) {
    // Only worth alerting when the account is already signed in elsewhere
    // (not on a first login / registration / the only device logging back in)
    const otherSessions = await this.prisma.session.count({
      where: { userId, isActive: true, id: { not: newSession.id } },
    });
    if (otherSessions === 0) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) return;

    const loginTime = newSession.createdAt.toLocaleString(
      'ar-EG',
      LOGIN_TIME_FORMAT,
    );

    await this.notificationsService.create({
      userId,
      type: 'NEW_DEVICE_LOGIN',
      title: 'تسجيل دخول من جهاز جديد',
      body: `${newSession.deviceName} · ${loginTime}`,
      data: { sessionId: newSession.id },
    });

    if (user.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'تسجيل دخول جديد إلى حسابك في بيوتنا',
        html: newDeviceLoginTemplate({
          userName: user.name || 'مستخدم بيوتنا',
          deviceName: newSession.deviceName,
          loginTime,
          ipAddress: newSession.ipAddress,
        }),
      });
    }
  }
}
