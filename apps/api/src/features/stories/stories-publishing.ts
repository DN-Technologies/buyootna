import { randomUUID } from 'crypto';

import type { PrismaService } from '../../core/prisma/prisma.service';
import type { StorageService } from '../../core/storage/storage.service';
import { assertCleanContent } from '../../core/content-filter/content-filter';
import { lockKeys } from '../identities/persona-rules';
import { CreateStoryUploadDto } from './dto/create-story-upload.dto';
import { PublishStoryDto } from './dto/publish-story.dto';
import type {
  AuthorStoryDto,
  StoryUploadSlotDto,
} from './dto/story-response.dto';
import type { StoriesMediaService } from './stories-media.service';
import type { StoriesReads } from './stories-reads';
import {
  STORY_LIFETIME_MS,
  STORY_PUT_TTL_SECONDS,
  STORY_UPLOAD_WINDOW_MS,
} from './stories.constants';
import {
  invalidMedia,
  storyNotFound,
  storyStateChanged,
  uploadExpired,
  uploadIncomplete,
} from './stories.errors';
import {
  assertCanPublish,
  assertOwnListing,
  assertWithinLimits,
  deletedRowKeptUntil,
  storyLockKey,
} from './stories.rules';

/** A story's life as its author drives it: upload slot, publish, delete. */
export class StoriesPublishing {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: StoriesMediaService,
    private readonly storage: StorageService,
    private readonly reads: StoriesReads,
  ) {}

  /**
   * An upload slot: a pending story with server-chosen keys and a presigned
   * PUT (two for a video: the file and its poster). A newer slot replaces
   * the profile's older pending one (the cleanup job removes its files and
   * row). Replacing and creating happen under the profile's lock, so
   * concurrent requests leave exactly one pending slot.
   */
  async createUpload(
    identityId: string,
    dto: CreateStoryUploadDto,
    now: Date,
  ): Promise<StoryUploadSlotDto> {
    await assertCanPublish(this.prisma, identityId);
    // Cheap early answer; repeated under the lock below
    await assertWithinLimits(this.prisma, identityId, now);

    const storyId = randomUUID();
    const mediaKey = this.media.mediaKeyFor(
      identityId,
      storyId,
      dto.contentType,
    );
    const poster = dto.mediaType === 'VIDEO' ? dto.poster : undefined;
    const posterKey = poster
      ? this.media.posterKeyFor(identityId, storyId)
      : null;
    const publishBefore = new Date(now.getTime() + STORY_UPLOAD_WINDOW_MS);

    await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, storyLockKey(identityId));
      await assertWithinLimits(tx, identityId, now);
      await tx.story.updateMany({
        where: { identityId, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'replaced', expiresAt: now },
      });
      await tx.story.create({
        data: {
          id: storyId,
          identityId,
          status: 'PENDING',
          mediaType: dto.mediaType,
          mediaKey,
          mediaContentType: dto.contentType,
          mediaSizeBytes: dto.sizeBytes,
          posterKey,
          posterSizeBytes: poster?.sizeBytes ?? null,
          expiresAt: publishBefore,
        },
      });
    });

    const [put, posterPut] = await Promise.all([
      this.media.presignUpload(
        storyId,
        mediaKey,
        dto.contentType,
        dto.sizeBytes,
      ),
      poster && posterKey
        ? this.media.presignUpload(
            storyId,
            posterKey,
            poster.contentType,
            poster.sizeBytes,
          )
        : Promise.resolve(null),
    ]);
    return {
      storyId,
      uploadUrlExpiresAt: new Date(
        now.getTime() + STORY_PUT_TTL_SECONDS * 1000,
      ).toISOString(),
      publishBefore: publishBefore.toISOString(),
      media: { method: 'PUT', url: put.url, headers: put.headers },
      ...(posterPut
        ? {
            poster: {
              method: 'PUT' as const,
              url: posterPut.url,
              headers: posterPut.headers,
            },
          }
        : {}),
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
    now: Date,
  ): Promise<AuthorStoryDto> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: {
        id: true,
        identityId: true,
        status: true,
        mediaType: true,
        mediaKey: true,
        posterKey: true,
        posterSizeBytes: true,
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
      throw storyNotFound();
    }
    if (story.status === 'ACTIVE') return this.reads.authorView(id, now);
    if (story.status === 'FAILED') {
      throw invalidMedia(story.failureReason, story.mediaType);
    }
    if (story.expiresAt <= now) throw uploadExpired();
    assertCleanContent(dto.caption);

    await assertCanPublish(this.prisma, identityId);
    // Cheap early answer before reading S3; repeated under the lock below
    await assertWithinLimits(this.prisma, identityId, now);
    if (dto.propertyId) {
      await assertOwnListing(this.prisma, dto.propertyId, identityId);
    }

    const check =
      story.mediaType === 'VIDEO'
        ? await this.media.checkVideo(story)
        : await this.media.checkImage(story);
    if (!check.ok && check.missing) throw uploadIncomplete(story.mediaType);
    if (!check.ok) {
      await this.prisma.story.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: check.reason, expiresAt: now },
      });
      // Now if possible; otherwise the cleanup retries until it succeeds
      await this.deleteMediaNow(id, this.media.keysOf(story), now);
      throw invalidMedia(check.reason, story.mediaType);
    }

    const caption = dto.caption?.trim() || null;
    const count = await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, storyLockKey(identityId));
      await assertWithinLimits(tx, identityId, now);
      const result = await tx.story.updateMany({
        // Still pending and still inside its upload window
        where: { id, status: 'PENDING', expiresAt: { gt: now } },
        data: {
          status: 'ACTIVE',
          publishedAt: now,
          expiresAt: new Date(now.getTime() + STORY_LIFETIME_MS),
          width: check.width,
          height: check.height,
          durationMs: check.durationMs ?? null,
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
        throw uploadExpired();
      }
      if (current?.status !== 'ACTIVE') throw storyStateChanged();
    }
    return this.reads.authorView(id, now);
  }

  /**
   * The author removes a story (published or still uploading). It leaves
   * every read at once and its files are deleted now; if S3 fails, the
   * cleanup retries until they are gone. A published story's row stays
   * until publishedAt + 24h so it keeps counting toward the 24-hour publish
   * limit (deleting doesn't free a slot). Repeating it is harmless.
   */
  async remove(id: string, identityId: string, now: Date): Promise<void> {
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
    if (!story || story.identityId !== identityId) throw storyNotFound();
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
}
