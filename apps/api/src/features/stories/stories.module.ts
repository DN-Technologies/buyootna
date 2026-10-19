import { Module } from '@nestjs/common';

import { ReportsModule } from '../reports/reports.module';

import { StoriesCleanupService } from './stories-cleanup.service';
import { StoriesFeedService } from './stories-feed.service';
import { StoriesMediaService } from './stories-media.service';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';

// PrismaModule and StorageModule are global
@Module({
  imports: [ReportsModule],
  controllers: [StoriesController],
  providers: [
    StoriesService,
    StoriesFeedService,
    StoriesMediaService,
    StoriesCleanupService,
  ],
})
export class StoriesModule {}
