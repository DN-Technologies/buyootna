import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';

/**
 * «صلاحية انتهاء الباقة»: an office bundle's unused ads are lost when its
 * validity ends. Spending and the wallet already ignore an expired credit;
 * this marks it EXPIRED so every count (admin, reports) agrees.
 */
@Injectable()
export class PlanSlotsExpiryService {
  private readonly logger = new Logger(PlanSlotsExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireDue(now = new Date()): Promise<number> {
    const { count } = await this.prisma.userPlanSlot.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });
    if (count > 0) this.logger.log(`Expired ${count} ad credit(s)`);
    return count;
  }
}
