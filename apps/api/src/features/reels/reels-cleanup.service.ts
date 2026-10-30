import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { ReelsMediaService } from './reels-media.service';
import {
  REEL_CLEANUP_BATCH,
  REEL_LIMIT_WINDOW_MS,
  REEL_ORPHAN_MIN_AGE_MS,
  REEL_PENDING_GRACE_MS,
  REEL_VIEW_RETENTION_MS,
} from './reels.constants';

export interface ReelPurgeResult {
  // Deleted / failed reels whose files were confirmed deleted this run
  filesCleared: number;
  purged: number;
  // Reels kept because a file could not be deleted (retried next run)
  kept: number;
}

export interface ReelReconcileResult {
  scanned: number;
  deleted: number;
  failed: number;
}

/** Rows whose files and row may go now. An active reel never does. */
export function dueForPurge(now: Date): Prisma.ReelWhereInput {
  return {
    OR: [
      // Upload abandoned (publish refuses after the deadline)
      {
        status: 'PENDING',
        uploadExpiresAt: {
          lt: new Date(now.getTime() - REEL_PENDING_GRACE_MS),
        },
      },
      { status: 'FAILED' },
      // Unpublished at once; published once it stops counting toward the limit
      { status: 'DELETED', publishedAt: null },
      {
        status: 'DELETED',
        publishedAt: { lte: new Date(now.getTime() - REEL_LIMIT_WINDOW_MS) },
      },
    ],
  };
}

/** Deleted / failed reels whose files are not confirmed deleted yet. */
export const FILES_TO_CLEAR: Prisma.ReelWhereInput = {
  status: { in: ['DELETED', 'FAILED'] },
  mediaDeletedAt: null,
};

type CleanupRow = {
  id: string;
  mediaKey: string;
  posterKey: string;
  mediaDeletedAt: Date | null;
};

/**
 * Removes reel files and rows. The files are public, so a removed reel's must
 * really go:
 * - a deleted or failed reel's files are deleted on every run until S3
 *   confirms it (mediaDeletedAt), even while its row must stay;
 * - a row is deleted only once all of its files are confirmed deleted; a file
 *   that couldn't be deleted keeps its row for the next run.
 * Every step can run again safely (deleting a missing key succeeds; deleting
 * a missing row does nothing).
 *
 * Single instance: the flags below stop overlapping runs in this process, as
 * in StoriesCleanupService.
 */
@Injectable()
export class ReelsCleanupService {
  private readonly logger = new Logger(ReelsCleanupService.name);
  private purging = false;
  private reconciling = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly media: ReelsMediaService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async purge(now = new Date()): Promise<ReelPurgeResult> {
    const result: ReelPurgeResult = { filesCleared: 0, purged: 0, kept: 0 };
    if (this.purging) return result;
    this.purging = true;
    try {
      // 1. Files of deleted / failed reels, as soon as possible
      await this.eachBatch(FILES_TO_CLEAR, async (batch) => {
        const cleared = await this.deleteFiles(batch);
        if (cleared.length) {
          const { count } = await this.prisma.reel.updateMany({
            where: { id: { in: cleared }, mediaDeletedAt: null },
            data: { mediaDeletedAt: now },
          });
          result.filesCleared += count;
        }
      });

      // 2. Rows that are due: any files left first, then the row
      await this.eachBatch(dueForPurge(now), async (batch) => {
        const cleared = new Set([
          ...batch.filter((r) => r.mediaDeletedAt).map((r) => r.id),
          ...(await this.deleteFiles(batch.filter((r) => !r.mediaDeletedAt))),
        ]);
        result.kept += batch.length - cleared.size;
        if (cleared.size) {
          const { count } = await this.prisma.reel.deleteMany({
            where: { id: { in: [...cleared] }, ...dueForPurge(now) },
          });
          result.purged += count;
        }
      });
    } catch (error) {
      this.logger.error('Reel purge failed', error as Error);
    } finally {
      this.purging = false;
    }
    if (result.filesCleared || result.purged || result.kept) {
      this.logger.log(
        `Reel cleanup: files cleared for ${result.filesCleared}, purged ${result.purged}, kept ${result.kept} for retry`,
      );
    }
    return result;
  }

  /**
   * Runs `handle` over every matching reel in id order, a batch at a time.
   * Walking forward by id means a reel kept this run isn't picked again.
   */
  private async eachBatch(
    where: Prisma.ReelWhereInput,
    handle: (batch: CleanupRow[]) => Promise<void>,
  ): Promise<void> {
    let afterId: string | undefined;
    for (;;) {
      const batch = await this.prisma.reel.findMany({
        where: { ...where, ...(afterId ? { id: { gt: afterId } } : {}) },
        select: {
          id: true,
          mediaKey: true,
          posterKey: true,
          mediaDeletedAt: true,
        },
        orderBy: { id: 'asc' },
        take: REEL_CLEANUP_BATCH,
      });
      if (batch.length === 0) return;
      afterId = batch[batch.length - 1].id;
      await handle(batch);
      if (batch.length < REEL_CLEANUP_BATCH) return;
    }
  }

  /** Deletes the reels' files; returns the ids whose files are all gone. */
  private async deleteFiles(batch: CleanupRow[]): Promise<string[]> {
    if (batch.length === 0) return [];
    const { failed } = await this.storage.deleteKeysReporting(
      batch.flatMap((r) => this.media.keysOf(r)),
    );
    const failedKeys = new Set(failed);
    return batch
      .filter((r) => this.media.keysOf(r).every((k) => !failedKeys.has(k)))
      .map((r) => r.id);
  }

  /**
   * Daily: drops per-viewer rows too old to matter. The reel keeps its count;
   * a reel that old may show as unseen again, which is fine.
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async pruneViews(now = new Date()): Promise<number> {
    try {
      const { count } = await this.prisma.reelView.deleteMany({
        where: {
          viewedAt: { lt: new Date(now.getTime() - REEL_VIEW_RETENTION_MS) },
        },
      });
      return count;
    } catch (error) {
      this.logger.error('Reel view pruning failed', error as Error);
      return 0;
    }
  }

  /**
   * Daily: deletes reel files that no row accounts for any more, left behind
   * when an account or profile was deleted (its rows cascade away without
   * touching S3). Production only: a development database doesn't know
   * production's reels, and may share its bucket, so there this would delete
   * real files.
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async reconcile(now = new Date()): Promise<ReelReconcileResult> {
    const result: ReelReconcileResult = { scanned: 0, deleted: 0, failed: 0 };
    if (process.env.NODE_ENV !== 'production' || this.reconciling)
      return result;
    this.reconciling = true;
    try {
      let token: string | undefined;
      do {
        const page = await this.storage.listKeys(this.media.prefix(), token);
        token = page.nextToken ?? undefined;
        result.scanned += page.objects.length;

        const candidates = page.objects.flatMap((o) => {
          const reelId = this.media.reelIdFromKey(o.key);
          const oldEnough =
            !!o.lastModified &&
            now.getTime() - o.lastModified.getTime() > REEL_ORPHAN_MIN_AGE_MS;
          // Keys we don't recognise are left alone
          return reelId && oldEnough ? [{ key: o.key, reelId }] : [];
        });
        if (candidates.length === 0) continue;

        const existing = await this.prisma.reel.findMany({
          where: { id: { in: [...new Set(candidates.map((c) => c.reelId))] } },
          select: { id: true },
        });
        const known = new Set(existing.map((r) => r.id));
        const orphans = candidates
          .filter((c) => !known.has(c.reelId))
          .map((c) => c.key);
        if (orphans.length === 0) continue;

        const { failed } = await this.storage.deleteKeysReporting(orphans);
        result.failed += failed.length;
        result.deleted += orphans.length - failed.length;
      } while (token);
    } catch (error) {
      this.logger.error('Reel reconciliation failed', error as Error);
    } finally {
      this.reconciling = false;
    }
    if (result.deleted || result.failed) {
      this.logger.log(
        `Reel files: deleted ${result.deleted} orphan(s), ${result.failed} failed`,
      );
    }
    return result;
  }
}
