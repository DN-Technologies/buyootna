import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class PropertiesExpiryService {
  private readonly logger = new Logger(PropertiesExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Property.endDate is computed per-listing at publish/renew time from the
  // owning plan's durationDays (see PropertiesQuotaService.resolvePublishQuota)
  // — nothing else in the codebase ever moves a listing out of ACTIVE once
  // that date passes, so every ACTIVE-only query (feed, map, search) kept
  // showing listings indefinitely. This is what actually enforces it.
  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireOverdueListings(): Promise<void> {
    const { count } = await this.prisma.property.updateMany({
      where: {
        status: ListingStatus.ACTIVE,
        endDate: { lte: new Date() },
      },
      data: { status: ListingStatus.EXPIRED },
    });

    if (count > 0) {
      this.logger.log(`Expired ${count} listing(s) past their endDate`);
    }
  }
}
