import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { CreateStoryUploadDto } from './dto/create-story-upload.dto';
import { PublishStoryDto } from './dto/publish-story.dto';
import { RecordStoryViewsDto } from './dto/record-story-views.dto';
import type {
  AuthorStoryDto,
  MyStoriesDto,
  StoryAuthorStoriesDto,
  StoryUploadSlotDto,
  StoryViewersDto,
} from './dto/story-response.dto';
import { StoryViewersQueryDto } from './dto/story-viewers-query.dto';
import { StoriesMediaService } from './stories-media.service';
import { StoriesPublishing } from './stories-publishing';
import { StoriesReads } from './stories-reads';
import { StoriesViews } from './stories-views';

export { deletedRowKeptUntil } from './stories.rules';

/**
 * Stories, as the controller uses them. The work lives in three parts:
 *  - StoriesPublishing: upload slots, publishing after the server's file
 *    check, deleting (stories-publishing.ts);
 *  - StoriesReads: the author's own stories and one author's
 *    (stories-reads.ts);
 *  - StoriesViews: recording views and the author's viewer list
 *    (stories-views.ts).
 * Shared rules (who may post, limits, the profile lock) are in
 * stories.rules.ts and the error answers in stories.errors.ts. The feed is
 * StoriesFeedService.
 */
@Injectable()
export class StoriesService {
  private readonly reads: StoriesReads;
  private readonly views: StoriesViews;
  private readonly publishing: StoriesPublishing;

  constructor(
    prisma: PrismaService,
    media: StoriesMediaService,
    storage: StorageService,
  ) {
    this.reads = new StoriesReads(prisma, media);
    this.views = new StoriesViews(prisma);
    this.publishing = new StoriesPublishing(prisma, media, storage, this.reads);
  }

  createUpload(
    identityId: string,
    dto: CreateStoryUploadDto,
    now = new Date(),
  ): Promise<StoryUploadSlotDto> {
    return this.publishing.createUpload(identityId, dto, now);
  }

  publish(
    id: string,
    identityId: string,
    dto: PublishStoryDto,
    now = new Date(),
  ): Promise<AuthorStoryDto> {
    return this.publishing.publish(id, identityId, dto, now);
  }

  remove(id: string, identityId: string, now = new Date()): Promise<void> {
    return this.publishing.remove(id, identityId, now);
  }

  findMine(identityId: string, now = new Date()): Promise<MyStoriesDto> {
    return this.reads.findMine(identityId, now);
  }

  findByAuthor(
    viewer: { identityId: string; userId: string },
    authorId: string,
    now = new Date(),
  ): Promise<StoryAuthorStoriesDto> {
    return this.reads.findByAuthor(viewer, authorId, now);
  }

  recordViews(
    viewer: { identityId: string; userId: string },
    dto: RecordStoryViewsDto,
    now = new Date(),
  ): Promise<void> {
    return this.views.record(viewer, dto, now);
  }

  viewers(
    id: string,
    identityId: string,
    query: StoryViewersQueryDto,
  ): Promise<StoryViewersDto> {
    return this.views.viewers(id, identityId, query);
  }
}
