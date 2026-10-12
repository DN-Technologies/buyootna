import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const DAY_MS = 24 * 60 * 60 * 1000;
// Days before the end at which the company is reminded to renew
const REMINDER_DAYS = [7, 1];

@Injectable()
export class CompanySubscriptionRemindersService {
  private readonly logger = new Logger(
    CompanySubscriptionRemindersService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // Renewal is manual, so a company has to hear that its period is ending
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async remindExpiring(now = new Date()): Promise<void> {
    for (const days of REMINDER_DAYS) {
      const from = new Date(now.getTime() + days * DAY_MS);
      const to = new Date(from.getTime() + DAY_MS);
      const ending = await this.prisma.companySubscription.findMany({
        where: { endsAt: { gte: from, lt: to } },
        select: {
          identityId: true,
          endsAt: true,
          identity: { select: { userId: true } },
        },
      });

      for (const period of ending) {
        // Already renewed: a later period follows this one
        const renewed = await this.prisma.companySubscription.findFirst({
          where: {
            identityId: period.identityId,
            endsAt: { gt: period.endsAt },
          },
          select: { id: true },
        });
        if (renewed) continue;

        await this.notifications.create({
          userId: period.identity.userId,
          identityId: period.identityId,
          type: 'SUBSCRIPTION_EXPIRING',
          title: 'اشتراك شركتك يقترب من الانتهاء',
          body:
            days === 1
              ? 'ينتهي اشتراكك غداً. جدّد الباقة لتستمر في استقبال الطلبات وإضافة الخدمات.'
              : `ينتهي اشتراكك خلال ${days} أيام. جدّد الباقة لتستمر في استقبال الطلبات وإضافة الخدمات.`,
          data: { endsAt: period.endsAt.toISOString() },
        });
      }
      if (ending.length > 0) {
        this.logger.log(
          `Checked ${ending.length} period(s) ending in ${days}d`,
        );
      }
    }
  }
}
