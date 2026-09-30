import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface SelfDeactivation {
  reasons: string[];
  note?: string | null;
  // End of a timed deactivation; null/undefined = until the user signs in
  until?: Date | null;
}

/**
 * The writes behind a self-deactivation and its end, shared by the
 * suspend endpoint, sign-in (AuthSessionService.login) and the hourly job
 * that ends timed deactivations.
 */
@Injectable()
export class AccountStateService {
  private readonly logger = new Logger(AccountStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Disables the account as the owner's choice, records why, and ends every
   * session so all devices are signed out -- in one transaction.
   */
  async deactivateByUser(userId: string, d: SelfDeactivation) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isDisabled: true,
          suspendedAt: new Date(),
          suspendedUntil: d.until ?? null,
        },
      }),
      this.prisma.accountSuspension.create({
        data: {
          userId,
          reasons: d.reasons,
          note: d.note ?? null,
          until: d.until ?? null,
        },
      }),
      this.prisma.session.deleteMany({ where: { userId } }),
    ]);
  }

  /** Ends a self-deactivation; the open suspension record gets its date. */
  async reactivate(userId: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: false, suspendedAt: null, suspendedUntil: null },
      }),
      this.prisma.accountSuspension.updateMany({
        where: { userId, reactivatedAt: null },
        data: { reactivatedAt: new Date() },
      }),
    ]);
  }

  /**
   * Reactivates every timed self-deactivation whose end has passed. Hourly,
   * so an account's ads come back within the hour, not up to a day late.
   * Admin suspensions never have suspendedAt, so they are never touched.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async reactivateExpired(now = new Date()): Promise<number> {
    const due = await this.prisma.user.findMany({
      where: {
        isDisabled: true,
        isBlocked: false,
        suspendedAt: { not: null },
        suspendedUntil: { lte: now },
      },
      select: { id: true },
    });
    for (const { id } of due) {
      try {
        await this.reactivate(id);
      } catch (err) {
        this.logger.error(`Reactivating ${id} failed`, err as Error);
      }
    }
    if (due.length) {
      this.logger.log(`Reactivated ${due.length} timed deactivation(s)`);
    }
    return due.length;
  }
}
