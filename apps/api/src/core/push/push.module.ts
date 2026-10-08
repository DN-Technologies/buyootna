import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { PushService } from './push.service';

@Module({
  providers: [PushService, BadgeService],
  exports: [PushService, BadgeService],
})
export class PushModule {}
