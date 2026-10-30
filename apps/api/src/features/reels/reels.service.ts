import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { assertCleanContent } from '../../core/content-filter/content-filter';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { lockKeys } from '../identities/persona-rules';
import { CreateReelUploadDto } from './dto/create-reel-upload.dto';
import { PublishReelDto } from './dto/publish-reel.dto';
import type { AuthorReelDto, ReelUploadSlotDto } from './dto/reel-response.dto';
import { ReelsMediaService } from './reels-media.service';
import { REEL_PUT_TTL_SECONDS, REEL_UPLOAD_WINDOW_MS } from './reels.constants';
import {
  invalidMedia,
  reelNotFound,
  reelStateChanged,
  uploadExpired,
  uploadIncomplete,
} from './reels.errors';
import { REEL_SELECT, toAuthorReelDto } from './reels.mapper';
import {
  assertCanPublish,
  assertOwnListing,
  assertWithinLimit,
  reelLockKey,
} from './reels.rules';

/** A reel's life as its author drives it: upload slot, publish, delete. */
@Injectable()
export class ReelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: ReelsMediaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * An upload slot: a pending reel with server-chosen keys and two presigned
   * PUTs (the file and its poster). A newer slot replaces the profile's older
   * pending one (the cleanup job removes its files and row). Replacing and
   * creating happen under the profile's lock, so concurrent requests leave
   * exactly one pending slot.
   */
  async createUpload(
    identityId: string,
    dto: CreateReelUploadDto,
    now = new Date(),
  ): Promise<ReelUploadSlotDto> {
    await assertCanPublish(this.prisma, identityId);
    // Cheap early answer; repeated under the lock below
    await assertWithinLimit(this.prisma, identityId, now);

    const reelId = randomUUID();
    const mediaKey = this.media.mediaKeyFor(identityId, reelId);
    const posterKey = this.media.posterKeyFor(identityId, reelId);
    const publishBefore = new Date(now.getTime() + REEL_UPLOAD_WINDOW_MS);

    await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, reelLockKey(identityId));
      await assertWithinLimit(tx, identityId, now);
      await tx.reel.updateMany({
        where: { identityId, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: 'replaced' },
      });
      await tx.reel.create({
        data: {
          id: reelId,
          identityId,
          status: 'PENDING',
          mediaKey,
          mediaContentType: dto.contentType,
          mediaSizeBytes: dto.sizeBytes,
          posterKey,
          posterSizeBytes: dto.poster.sizeBytes,
          uploadExpiresAt: publishBefore,
        },
      });
    });

    const [put, posterPut] = await Promise.all([
      this.media.presignUpload(
        reelId,
        mediaKey,
        dto.contentType,
        dto.sizeBytes,
      ),
      this.media.presignUpload(
        reelId,
        posterKey,
        dto.poster.contentType,
        dto.poster.sizeBytes,
      ),
    ]);
    return {
      reelId,
      uploadUrlExpiresAt: new Date(
        now.getTime() + REEL_PUT_TTL_SECONDS * 1000,
      ).toISOString(),
      publishBefore: publishBefore.toISOString(),
      media: { method: 'PUT', url: put.url, headers: put.headers },
      poster: { method: 'PUT', url: posterPut.url, headers: posterPut.headers },
    };
  }

  /**
   * Publishes an uploaded reel once the server has checked the file itself.
   * The S3 checks run first, outside any transaction; then, under the
   * profile's lock, the limit is counted again and the reel is activated only
   * if it is still pending and within its upload window. Repeating it returns
   * the published reel.
   */
  async publish(
    id: string,
    identityId: string,
    dto: PublishReelDto,
    now = new Date(),
  ): Promise<AuthorReelDto> {
    const reel = await this.prisma.reel.findUnique({
      where: { id },
      select: {
        id: true,
        identityId: true,
        status: true,
        mediaKey: true,
        posterKey: true,
        posterSizeBytes: true,
        mediaContentType: true,
        mediaSizeBytes: true,
        uploadExpiresAt: true,
        failureReason: true,
      },
    });
    if (!reel || reel.identityId !== identityId || reel.status === 'DELETED') {
      throw reelNotFound();
    }
    if (reel.status === 'ACTIVE') return this.authorView(id, now);
    if (reel.status === 'FAILED') throw invalidMedia(reel.failureReason);
    if (reel.uploadExpiresAt <= now) throw uploadExpired();
    assertCleanContent(dto.caption);

    await assertCanPublish(this.prisma, identityId);
    // Cheap early answer before reading S3; repeated under the lock below
    await assertWithinLimit(this.prisma, identityId, now);
    if (dto.propertyId) {
      await assertOwnListing(this.prisma, dto.propertyId, identityId);
    }

    const check = await this.media.checkVideo(reel);
    if (!check.ok && check.missing) throw uploadIncomplete();
    if (!check.ok) {
      await this.prisma.reel.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'FAILED', failureReason: check.reason },
      });
      // Now if possible; otherwise the cleanup retries until it succeeds
      await this.deleteMediaNow(id, this.media.keysOf(reel), now);
      throw invalidMedia(check.reason);
    }

    const count = await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, reelLockKey(identityId));
      await assertWithinLimit(tx, identityId, now);
      const result = await tx.reel.updateMany({
        // Still pending and still inside its upload window
        where: { id, status: 'PENDING', uploadExpiresAt: { gt: now } },
        data: {
          status: 'ACTIVE',
          publishedAt: now,
          width: check.width,
          height: check.height,
          durationMs: check.durationMs ?? null,
          caption: dto.caption?.trim() || null,
          propertyId: dto.propertyId ?? null,
          hadListing: !!dto.propertyId,
        },
      });
      return result.count;
    });
    if (count === 0) {
      // A parallel publish won (return it), or the slot ended meanwhile
      const current = await this.prisma.reel.findUnique({
        where: { id },
        select: { status: true, uploadExpiresAt: true },
      });
      if (current?.status === 'PENDING' && current.uploadExpiresAt <= now) {
        throw uploadExpired();
      }
      if (current?.status !== 'ACTIVE') throw reelStateChanged();
    }
    return this.authorView(id, now);
  }

  /**
   * The author removes a reel (published or still uploading). It leaves every
   * read at once and its files are deleted now; if S3 fails, the cleanup
   * retries until they are gone. A published reel's row stays for 24 hours so
   * it keeps counting toward the publish limit. Repeating it is harmless.
   */
  async remove(
    id: string,
    identityId: string,
    now = new Date(),
  ): Promise<void> {
    const reel = await this.prisma.reel.findUnique({
      where: { id },
      select: {
        identityId: true,
        status: true,
        mediaKey: true,
        posterKey: true,
      },
    });
    if (!reel || reel.identityId !== identityId) throw reelNotFound();
    if (reel.status === 'DELETED' || reel.status === 'FAILED') return;

    await this.prisma.reel.updateMany({
      where: { id, status: { in: ['PENDING', 'ACTIVE'] } },
      data: { status: 'DELETED', deletedAt: now },
    });
    await this.deleteMediaNow(id, this.media.keysOf(reel), now);
  }

  private async authorView(id: string, now: Date): Promise<AuthorReelDto> {
    const reel = await this.prisma.reel.findUniqueOrThrow({
      where: { id },
      select: REEL_SELECT,
    });
    return toAuthorReelDto(reel, this.media.linksFor(reel), now);
  }

  /**
   * Deletes a deleted / failed reel's files and records it once all are gone;
   * whatever fails is left to the cleanup's retries.
   */
  private async deleteMediaNow(
    id: string,
    keys: string[],
    now: Date,
  ): Promise<void> {
    const { failed } = await this.storage.deleteKeysReporting(keys);
    if (failed.length === 0) {
      await this.prisma.reel.updateMany({
        where: { id, mediaDeletedAt: null },
        data: { mediaDeletedAt: now },
      });
    }
  }
}
