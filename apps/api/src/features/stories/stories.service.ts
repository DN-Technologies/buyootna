import { randomUUID } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { assertActiveCompanySubscription } from '../company-subscriptions/company-subscription.rules';
import { assertApprovedProvider, lockKeys } from '../identities/persona-rules';
import { CreateStoryUploadDto } from './dto/create-story-upload.dto';
import { PublishStoryDto } from './dto/publish-story.dto';
import type {
  AuthorStoryDto,
  MyStoriesDto,
  StoryAuthorStoriesDto,
  StoryUploadSlotDto,
} from './dto/story-response.dto';
import { StoriesMediaService } from './stories-media.service';
import {
  STORY_ACTIVE_LIMIT,
  STORY_DAILY_PUBLISH_LIMIT,
  STORY_LIFETIME_MS,
  STORY_PUT_TTL_SECONDS,
  STORY_UPLOAD_WINDOW_MS,
} from './stories.constants';
import {
  AUTHOR_SELECT,
  firstUnseenIndex,
  liveStoryWhere,
  STORY_SELECT,
  toAuthorDto,
  toViewerStoryDto,
  VISIBLE_AUTHOR_WHERE,
} from './stories.mapper';

const DAY_MS = 24 * 60 * 60 * 1000;

type Db = Prisma.TransactionClient | PrismaService;

/**
 * Serialises one profile's slot replacement and publishing (the limit
 * counts and the change they guard happen under the same lock).
 */
const storyLockKey = (identityId: string) => `story:${identityId}`;

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: StoriesMediaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * An upload slot: a pending story with server-chosen keys and a presigned
   * PUT. A newer slot replaces the profile's older pending one (the cleanup
   * job removes its files and row). Replacing and creating happen under the
   * profile's lock, so concurrent requests leave exactly one pending slot.
   */
  async createUpload(
    identityId: string,
    dto: CreateStoryUploadDto,
    now = new Date(),
  ): Promise<StoryUploadSlotDto> {
    await this.assertCanPublish(identityId);
    // Cheap early answer; repeated under the lock below
    await this.assertWithinLimits(this.prisma, identityId, now);

    const storyId = randomUUID();
    const mediaKey = this.media.mediaKeyFor(
      identityId,
      storyId,
      dto.contentType,
    );
    const publishBefore = new Date(now.getTime() + STORY_UPLOAD_WINDOW_MS);

    await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, storyLockKey(identityId));
      await this.assertWithinLimits(tx, identityId, now);
      await tx.story.updateMany({
        where: { identityId, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'replaced', expiresAt: now },
      });
      await tx.story.create({
        data: {
          id: storyId,
          identityId,
          status: 'PENDING',
          mediaType: 'IMAGE',
          mediaKey,
          mediaContentType: dto.contentType,
          mediaSizeBytes: dto.sizeBytes,
          expiresAt: publishBefore,
        },
      });
    });

    const put = await this.media.presignUpload(
      storyId,
      mediaKey,
      dto.contentType,
      dto.sizeBytes,
    );
    return {
      storyId,
      uploadUrlExpiresAt: new Date(
        now.getTime() + STORY_PUT_TTL_SECONDS * 1000,
      ).toISOString(),
      publishBefore: publishBefore.toISOString(),
      media: { method: 'PUT', url: put.url, headers: put.headers },
    };
  }

  /**
   * Publishes an uploaded story once the server has checked the file
   * itself. The S3 checks run first, outside any transaction; then, under
   * the profile's lock, the limits are counted again and the story is
   * activated only if it is still pending and within its upload window.
   * Repeating it returns the published story.
   */
  async publish(
    id: string,
    identityId: string,
    dto: PublishStoryDto,
    now = new Date(),
  ): Promise<AuthorStoryDto> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: {
        id: true,
        identityId: true,
        status: true,
        mediaKey: true,
        posterKey: true,
        mediaContentType: true,
        mediaSizeBytes: true,
        expiresAt: true,
        failureReason: true,
      },
    });
    if (
      !story ||
      story.identityId !== identityId ||
      story.status === 'DELETED'
    ) {
      throw new NotFoundException('القصة غير موجودة');
    }
    if (story.status === 'ACTIVE') return this.authorView(id, now);
    if (story.status === 'FAILED') throw this.invalidMedia(story.failureReason);
    if (story.expiresAt <= now) {
      throw new GoneException({
        statusCode: 410,
        message: 'انتهت مهلة رفع القصة، يرجى المحاولة مرة أخرى',
        code: 'STORY_UPLOAD_EXPIRED',
      });
    }

    await this.assertCanPublish(identityId);
    // Cheap early answer before reading S3; repeated under the lock below
    await this.assertWithinLimits(this.prisma, identityId, now);
    if (dto.propertyId) await this.assertOwnListing(dto.propertyId, identityId);

    const check = await this.media.checkImage(story);
    if (!check.ok && check.missing) {
      throw new ConflictException({
        statusCode: 409,
        message: 'لم يكتمل رفع الصورة بعد',
        code: 'STORY_UPLOAD_INCOMPLETE',
      });
    }
    if (!check.ok) {
      await this.prisma.story.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: check.reason, expiresAt: now },
      });
      // Now if possible; otherwise the cleanup retries until it succeeds
      await this.deleteMediaNow(id, this.media.keysOf(story), now);
      throw this.invalidMedia(check.reason);
    }

    const caption = dto.caption?.trim() || null;
    const count = await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, storyLockKey(identityId));
      await this.assertWithinLimits(tx, identityId, now);
      const result = await tx.story.updateMany({
        // Still pending and still inside its upload window
        where: { id, status: 'PENDING', expiresAt: { gt: now } },
        data: {
          status: 'ACTIVE',
          publishedAt: now,
          expiresAt: new Date(now.getTime() + STORY_LIFETIME_MS),
          width: check.width,
          height: check.height,
          caption,
          propertyId: dto.propertyId ?? null,
        },
      });
      return result.count;
    });
    if (count === 0) {
      // A parallel publish won (return it), or the slot ended meanwhile
      const current = await this.prisma.story.findUnique({
        where: { id },
        select: { status: true, expiresAt: true },
      });
      if (current?.status === 'PENDING' && current.expiresAt <= now) {
        throw new GoneException({
          statusCode: 410,
          message: 'انتهت مهلة رفع القصة، يرجى المحاولة مرة أخرى',
          code: 'STORY_UPLOAD_EXPIRED',
        });
      }
      if (current?.status !== 'ACTIVE') {
        throw new ConflictException({
          statusCode: 409,
          message: 'تغيرت حالة القصة، يرجى المحاولة مرة أخرى',
          code: 'STORY_STATE_CHANGED',
        });
      }
    }
    return this.authorView(id, now);
  }

  /**
   * The author removes a story (published or still uploading). It leaves
   * every read at once and its files are deleted now; if S3 fails, the
   * cleanup retries until they are gone. A published story's row stays
   * until publishedAt + 24h so it keeps counting toward the 24-hour publish
   * limit (deleting doesn't free a slot). Repeating it is harmless.
   */
  async remove(
    id: string,
    identityId: string,
    now = new Date(),
  ): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: {
        identityId: true,
        status: true,
        mediaKey: true,
        posterKey: true,
        publishedAt: true,
      },
    });
    if (!story || story.identityId !== identityId) {
      throw new NotFoundException('القصة غير موجودة');
    }
    if (story.status === 'DELETED' || story.status === 'FAILED') return;

    await this.prisma.story.updateMany({
      where: { id, status: { in: ['PENDING', 'ACTIVE'] } },
      data: {
        status: 'DELETED',
        deletedAt: now,
        expiresAt: deletedRowKeptUntil(story.publishedAt, now),
      },
    });
    await this.deleteMediaNow(id, this.media.keysOf(story), now);
  }

  /**
   * Deletes a deleted / failed story's files and records it once all are
   * gone; whatever fails is left to the cleanup's retries.
   */
  private async deleteMediaNow(
    id: string,
    keys: string[],
    now: Date,
  ): Promise<void> {
    const { failed } = await this.storage.deleteKeysReporting(keys);
    if (failed.length === 0) {
      await this.prisma.story.updateMany({
        where: { id, mediaDeletedAt: null },
        data: { mediaDeletedAt: now },
      });
    }
  }

  /** The profile's own live stories, oldest first, with their view counts. */
  async findMine(identityId: string, now = new Date()): Promise<MyStoriesDto> {
    const rows = await this.prisma.story.findMany({
      where: { identityId, ...liveStoryWhere(now) },
      select: STORY_SELECT,
      orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
    });
    const counts = rows.length
      ? await this.prisma.storyView.groupBy({
          by: ['storyId'],
          where: { storyId: { in: rows.map((r) => r.id) } },
          _count: { _all: true },
        })
      : [];
    const countOf = new Map(counts.map((c) => [c.storyId, c._count._all]));

    const stories = await Promise.all(
      rows.map(async (row) => ({
        ...toViewerStoryDto(row, await this.media.linksFor(row, now), true),
        viewCount: countOf.get(row.id) ?? 0,
      })),
    );
    return { stories };
  }

  /** One author's live stories, as the viewing profile sees them. */
  async findByAuthor(
    viewerIdentityId: string,
    authorId: string,
    now = new Date(),
  ): Promise<StoryAuthorStoriesDto> {
    const author = await this.prisma.identity.findFirst({
      where: { id: authorId, ...VISIBLE_AUTHOR_WHERE },
      select: AUTHOR_SELECT,
    });
    const authorDto = author ? toAuthorDto(author) : null;
    if (!authorDto) throw new NotFoundException('الحساب غير موجود');

    const rows = await this.prisma.story.findMany({
      where: { identityId: authorId, ...liveStoryWhere(now) },
      select: STORY_SELECT,
      orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
    });
    const [views, follow] = await Promise.all([
      rows.length
        ? this.prisma.storyView.findMany({
            where: {
              viewerIdentityId,
              storyId: { in: rows.map((r) => r.id) },
            },
            select: { storyId: true },
          })
        : Promise.resolve<{ storyId: string }[]>([]),
      this.prisma.providerFavorite.findUnique({
        where: {
          identityId_providerId: {
            identityId: viewerIdentityId,
            providerId: authorId,
          },
        },
        select: { id: true },
      }),
    ]);
    const seen = new Set(views.map((v) => v.storyId));

    const stories = await Promise.all(
      rows.map(async (row) =>
        toViewerStoryDto(
          row,
          await this.media.linksFor(row, now),
          seen.has(row.id),
        ),
      ),
    );
    return {
      author: authorDto,
      followed: !!follow,
      hasUnseen: stories.some((s) => !s.viewed),
      firstUnseenIndex: firstUnseenIndex(stories),
      stories,
    };
  }

  /** The author's view of one of its stories. */
  private async authorView(id: string, now: Date): Promise<AuthorStoryDto> {
    const row = await this.prisma.story.findUniqueOrThrow({
      where: { id },
      select: STORY_SELECT,
    });
    const viewCount = await this.prisma.storyView.count({
      where: { storyId: id },
    });
    return {
      ...toViewerStoryDto(row, await this.media.linksFor(row, now), true),
      viewCount,
    };
  }

  /**
   * Approved companies and offices only; a company also needs a running
   * subscription (or trial), the same rule as adding services or projects.
   */
  private async assertCanPublish(identityId: string): Promise<void> {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      select: { type: true },
    });
    if (identity?.type !== 'COMPANY' && identity?.type !== 'OFFICE') {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'نشر القصص متاح للشركات والمكاتب فقط',
        code: 'STORY_PUBLISHER_ONLY',
      });
    }
    await assertApprovedProvider(this.prisma, identityId);
    await assertActiveCompanySubscription(this.prisma, identityId);
  }

  /**
   * At most 20 live stories, and 30 published in any 24 hours. Pass the
   * transaction holding the profile's lock for an authoritative answer.
   */
  private async assertWithinLimits(
    db: Db,
    identityId: string,
    now: Date,
  ): Promise<void> {
    const [live, publishedToday] = await Promise.all([
      db.story.count({
        where: { identityId, ...liveStoryWhere(now) },
      }),
      // Deleted stories count too: their rows are kept until publishedAt +
      // 24h, so deleting doesn't free a slot
      db.story.count({
        where: {
          identityId,
          publishedAt: { gt: new Date(now.getTime() - DAY_MS) },
        },
      }),
    ]);
    if (
      live >= STORY_ACTIVE_LIMIT ||
      publishedToday >= STORY_DAILY_PUBLISH_LIMIT
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'وصلت للحد الأقصى من القصص، حاول لاحقاً',
          code: 'STORY_LIMIT',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async assertOwnListing(
    propertyId: string,
    identityId: string,
  ): Promise<void> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, identityId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!property) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'يمكن ربط القصة بإعلاناتك النشطة فقط',
        code: 'STORY_PROPERTY_INVALID',
      });
    }
  }

  private invalidMedia(reason: string | null): UnprocessableEntityException {
    return new UnprocessableEntityException({
      statusCode: 422,
      message: 'الملف المرفوع غير صالح، يرجى اختيار صورة أخرى',
      code: 'STORY_MEDIA_INVALID',
      reason,
    });
  }
}

/**
 * How long a deleted story's row is kept: a published one until it no
 * longer counts toward the 24-hour publish limit, an unpublished one not
 * at all.
 */
export function deletedRowKeptUntil(publishedAt: Date | null, now: Date): Date {
  if (!publishedAt) return now;
  const countsUntil = publishedAt.getTime() + STORY_LIFETIME_MS;
  return new Date(Math.max(countsUntil, now.getTime()));
}
