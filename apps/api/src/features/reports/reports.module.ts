import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ModerationAlertService } from './moderation-alert.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ModerationAlertService],
  exports: [ReportsService],
})
export class ReportsModule {}
