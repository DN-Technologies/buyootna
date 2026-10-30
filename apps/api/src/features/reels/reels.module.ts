import { Module } from '@nestjs/common';

import { StoriesModule } from '../stories/stories.module';

import { ReelsCleanupService } from './reels-cleanup.service';
import { ReelsEnabledGuard } from './reels-enabled.guard';
import { ReelsMediaService } from './reels-media.service';
import {
  ReelsAvailabilityController,
  ReelsController,
} from './reels.controller';
import { ReelsService } from './reels.service';

// PrismaModule and StorageModule are global
@Module({
  imports: [StoriesModule],
  controllers: [ReelsAvailabilityController, ReelsController],
  providers: [
    ReelsService,
    ReelsMediaService,
    ReelsCleanupService,
    ReelsEnabledGuard,
  ],
})
export class ReelsModule {}
