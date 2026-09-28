import { Injectable, Logger } from '@nestjs/common';
import { Session } from '@prisma/client';
import { MailService } from '../../core/mail/mail.service';
import { newDeviceLoginTemplate } from '../../core/mail/templates/new-device-login.template';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PushService } from '../../core/push/push.service';
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
    private readonly pushService: PushService,
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
    const otherSessions = await this.prisma.session.findMany({
      where: { userId, isActive: true, id: { not: newSession.id } },
      select: { pushToken: true },
    });
    if (otherSessions.length === 0) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) return;

    const loginTime = newSession.createdAt.toLocaleString(
      'ar-EG',
      LOGIN_TIME_FORMAT,
    );

    const title = 'تسجيل دخول من جهاز جديد';
    const body = [newSession.deviceName, newSession.location, loginTime]
      .filter(Boolean)
      .join(' · ');

    await this.notificationsService.create({
      userId,
      type: 'NEW_DEVICE_LOGIN',
      title,
      body,
      data: { sessionId: newSession.id },
    });

    // Push to the account's other devices (never the one that just logged in)
    await this.pushService.sendToTokens(
      otherSessions.map((s) => s.pushToken).filter((t): t is string => !!t),
      { title, body, data: { type: 'NEW_DEVICE_LOGIN', route: '/devices' } },
    );

    if (user.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'تسجيل دخول جديد إلى حسابك في بيوتنا',
        html: newDeviceLoginTemplate({
          userName: user.name || 'مستخدم بيوتنا',
          deviceName: newSession.deviceName,
          loginTime,
          location: newSession.location,
          ipAddress: newSession.ipAddress,
        }),
      });
    }
  }
}
