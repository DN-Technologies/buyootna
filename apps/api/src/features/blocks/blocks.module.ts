import { Module } from '@nestjs/common';

import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
