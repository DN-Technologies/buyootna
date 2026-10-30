import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { ReportsModule } from '../reports/reports.module';
import { StoriesModule } from '../stories/stories.module';

import { ReelsCleanupService } from './reels-cleanup.service';
import { ReelsCommentsService } from './reels-comments.service';
import { ReelsEnabledGuard } from './reels-enabled.guard';
import { ReelsEngagementService } from './reels-engagement.service';
import { ReelsFeedService } from './reels-feed.service';
import { ReelsMediaService } from './reels-media.service';
import { ReelsRankingService } from './reels-ranking.service';
import {
  ReelsAvailabilityController,
  ReelsController,
} from './reels.controller';
import { ReelsService } from './reels.service';

// PrismaModule and StorageModule are global
@Module({
  imports: [StoriesModule, ReportsModule, NotificationsModule],
  controllers: [ReelsAvailabilityController, ReelsController],
  providers: [
    ReelsService,
    ReelsFeedService,
    ReelsEngagementService,
    ReelsMediaService,
    ReelsCommentsService,
    ReelsCleanupService,
    ReelsRankingService,
    ReelsEnabledGuard,
  ],
})
export class ReelsModule {}
