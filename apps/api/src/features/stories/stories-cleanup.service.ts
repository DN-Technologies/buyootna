import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { StoriesMediaService } from './stories-media.service';
import {
  STORY_CLEANUP_BATCH,
  STORY_ARCHIVE_MS,
  STORY_ORPHAN_MIN_AGE_MS,
  STORY_PENDING_GRACE_MS,
  STORY_PREFIX,
} from './stories.constants';

export interface PurgeResult {
  // Deleted / failed stories whose files were confirmed deleted this run
  filesCleared: number;
  purged: number;
  // Stories kept because a file could not be deleted (retried next run)
  kept: number;
}

export interface ReconcileResult {
  scanned: number;
  deleted: number;
  failed: number;
}

/** Rows whose files and row may go now. */
export function dueForPurge(now: Date): Prisma.StoryWhereInput {
  return {
    OR: [
      // Out of its author's 30-day archive, and in no highlight (those stay
      // on the profile until taken out)
      {
        status: 'ACTIVE',
        expiresAt: { lt: new Date(now.getTime() - STORY_ARCHIVE_MS) },
        highlightItems: { none: {} },
      },
      // Upload abandoned (publish refuses after the deadline)
      {
        status: 'PENDING',
        expiresAt: { lt: new Date(now.getTime() - STORY_PENDING_GRACE_MS) },
      },
      // A deleted published story is kept until publishedAt + 24h (it still
      // counts toward the publish limit); unpublished / failed ones at once
      { status: { in: ['DELETED', 'FAILED'] }, expiresAt: { lte: now } },
    ],
  };
}

/** Deleted / failed stories whose files are not confirmed deleted yet. */
export const FILES_TO_CLEAR: Prisma.StoryWhereInput = {
  status: { in: ['DELETED', 'FAILED'] },
  mediaDeletedAt: null,
};

type CleanupRow = {
  id: string;
  mediaKey: string;
  posterKey: string | null;
  mediaDeletedAt: Date | null;
};

/**
 * Removes story files and rows. S3 is the source of truth for privacy, so:
 * - a deleted or failed story's files are deleted on every run until S3
 *   confirms it (mediaDeletedAt), even while its row must stay;
 * - a row is deleted only once all of its files are confirmed deleted; a
 *   file that couldn't be deleted keeps its row for the next run.
 * Every step can run again safely (deleting a missing key succeeds;
 * deleting a missing row does nothing). The S3 lifecycle rule on stories/
 * is only a backstop.
 *
 * Single instance: the flags below stop overlapping runs in this process.
 * Before running more than one API instance, add a cross-instance lease
 * (a lock row with an expiry, or an advisory lock held on a dedicated
 * connection: pooled connections break lock / unlock pairing). Without it
 * extra instances only repeat the same idempotent work.
 */
@Injectable()
export class StoriesCleanupService {
  private readonly logger = new Logger(StoriesCleanupService.name);
  // One run of each job at a time in this process (see the class comment
  // for running several instances)
  private purging = false;
  private reconciling = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly media: StoriesMediaService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async purge(now = new Date()): Promise<PurgeResult> {
    const result: PurgeResult = { filesCleared: 0, purged: 0, kept: 0 };
    if (this.purging) return result;
    this.purging = true;
    try {
      // 1. Files of deleted / failed stories, as soon as possible
      await this.eachBatch(FILES_TO_CLEAR, async (batch) => {
        const cleared = await this.deleteFiles(batch);
        if (cleared.length) {
          const { count } = await this.prisma.story.updateMany({
            where: { id: { in: cleared }, mediaDeletedAt: null },
            data: { mediaDeletedAt: now },
          });
          result.filesCleared += count;
        }
      });

      // 2. Rows that are due: any files left first, then the row
      await this.eachBatch(dueForPurge(now), async (batch) => {
        const cleared = new Set([
          ...batch.filter((s) => s.mediaDeletedAt).map((s) => s.id),
          ...(await this.deleteFiles(batch.filter((s) => !s.mediaDeletedAt))),
        ]);
        result.kept += batch.length - cleared.size;
        if (cleared.size) {
          const { count } = await this.prisma.story.deleteMany({
            where: { id: { in: [...cleared] }, ...dueForPurge(now) },
          });
          result.purged += count;
        }
      });
    } catch (error) {
      this.logger.error('Story purge failed', error as Error);
    } finally {
      this.purging = false;
    }
    if (result.filesCleared || result.purged || result.kept) {
      this.logger.log(
        `Story cleanup: files cleared for ${result.filesCleared}, purged ${result.purged}, kept ${result.kept} for retry`,
      );
    }
    return result;
  }

  /**
   * Runs `handle` over every matching story in id order, a batch at a time.
   * Walking forward by id means a story kept this run isn't picked again.
   */
  private async eachBatch(
    where: Prisma.StoryWhereInput,
    handle: (batch: CleanupRow[]) => Promise<void>,
  ): Promise<void> {
    let afterId: string | undefined;
    for (;;) {
      const batch = await this.prisma.story.findMany({
        where: { ...where, ...(afterId ? { id: { gt: afterId } } : {}) },
        select: {
          id: true,
          mediaKey: true,
          posterKey: true,
          mediaDeletedAt: true,
        },
        orderBy: { id: 'asc' },
        take: STORY_CLEANUP_BATCH,
      });
      if (batch.length === 0) return;
      afterId = batch[batch.length - 1].id;
      await handle(batch);
      if (batch.length < STORY_CLEANUP_BATCH) return;
    }
  }

  /** Deletes the stories' files; returns the ids whose files are all gone. */
  private async deleteFiles(batch: CleanupRow[]): Promise<string[]> {
    if (batch.length === 0) return [];
    const { failed } = await this.storage.deleteKeysReporting(
      batch.flatMap((s) => this.media.keysOf(s)),
    );
    const failedKeys = new Set(failed);
    return batch
      .filter((s) => this.media.keysOf(s).every((k) => !failedKeys.has(k)))
      .map((s) => s.id);
  }

  /**
   * Daily: deletes story files that no row accounts for any more — left
   * behind when an account or profile was deleted (its rows cascade away
   * without touching S3). Files of any existing row are the purge's job.
   * Production only: a development database doesn't know production's
   * stories, and may share its bucket, so there this would delete real
   * files.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async reconcile(now = new Date()): Promise<ReconcileResult> {
    const result: ReconcileResult = { scanned: 0, deleted: 0, failed: 0 };
    if (process.env.NODE_ENV !== 'production' || this.reconciling)
      return result;
    this.reconciling = true;
    try {
      let token: string | undefined;
      do {
        const page = await this.storage.listKeys(STORY_PREFIX, token);
        token = page.nextToken ?? undefined;
        result.scanned += page.objects.length;

        const candidates = page.objects.flatMap((o) => {
          const storyId = this.media.storyIdFromKey(o.key);
          const oldEnough =
            !!o.lastModified &&
            now.getTime() - o.lastModified.getTime() > STORY_ORPHAN_MIN_AGE_MS;
          // Keys we don't recognise are left alone
          return storyId && oldEnough ? [{ key: o.key, storyId }] : [];
        });
        if (candidates.length === 0) continue;

        const existing = await this.prisma.story.findMany({
          where: { id: { in: [...new Set(candidates.map((c) => c.storyId))] } },
          select: { id: true },
        });
        const known = new Set(existing.map((s) => s.id));
        const orphans = candidates
          .filter((c) => !known.has(c.storyId))
          .map((c) => c.key);
        if (orphans.length === 0) continue;

        const { failed } = await this.storage.deleteKeysReporting(orphans);
        result.failed += failed.length;
        result.deleted += orphans.length - failed.length;
      } while (token);
    } catch (error) {
      this.logger.error('Story reconciliation failed', error as Error);
    } finally {
      this.reconciling = false;
    }
    if (result.deleted || result.failed) {
      this.logger.log(
        `Story files: deleted ${result.deleted} orphan(s), ${result.failed} failed`,
      );
    }
    return result;
  }
}
