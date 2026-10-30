import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import type { RecordReelViewsDto } from './dto/record-reel-views.dto';
import type { RecordReelWatchesDto } from './dto/record-reel-watches.dto';
import type { ReelLikeDto } from './dto/reel-response.dto';
import type { ReelViewer } from './reels-feed.service';
import { reelNotFound } from './reels.errors';
import { visibleReelAuthor } from './reels.mapper';

/** Views and likes. Each counts once per profile, and repeating is harmless. */
@Injectable()
export class ReelsEngagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records that the viewing profile watched these reels. Only published
   * reels of authors it may see count, and never its own account's. Anything
   * else in the batch is skipped without an error. The count rises only for
   * rows really added, in the same transaction, in id order so two batches
   * can't deadlock on the same reels.
   */
  async recordViews(
    viewer: ReelViewer,
    dto: RecordReelViewsDto,
  ): Promise<void> {
    const reels = await this.prisma.reel.findMany({
      where: {
        id: { in: dto.reelIds },
        status: 'ACTIVE',
        identity: {
          ...visibleReelAuthor(viewer.userId),
          userId: { not: viewer.userId },
        },
      },
      select: { id: true },
    });
    if (reels.length === 0) return;
    const ids = reels.map((r) => r.id).sort();

    await this.prisma.$transaction(async (tx) => {
      const added = await tx.$queryRaw<{ reelId: string }[]>(Prisma.sql`
        INSERT INTO "ReelView" ("reelId", "viewerIdentityId")
        SELECT id, ${viewer.identityId} FROM unnest(${ids}::text[]) AS id
        ON CONFLICT DO NOTHING
        RETURNING "reelId"
      `);
      if (added.length === 0) return;
      await tx.reel.updateMany({
        where: { id: { in: added.map((a) => a.reelId).sort() } },
        data: { viewCount: { increment: 1 } },
      });
    });
  }

  /**
   * Adds how much of each reel was watched to the profile's view of it, keeping
   * the highest. A watch with no view yet (under 3 seconds) adds nothing, and
   * the time can't exceed what the server measured the reel to be.
   */
  async recordWatches(
    viewer: ReelViewer,
    dto: RecordReelWatchesDto,
  ): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "ReelView" v
      SET "watchedMs" = GREATEST(v."watchedMs", LEAST(d.ms, COALESCE(r."durationMs", d.ms))),
          completed = v.completed OR d.completed
      FROM unnest(
             ${dto.watches.map((w) => w.reelId)}::text[],
             ${dto.watches.map((w) => w.watchedMs)}::int[],
             ${dto.watches.map((w) => w.completed)}::boolean[]
           ) AS d(id, ms, completed)
      JOIN "Reel" r ON r.id = d.id
      WHERE v."reelId" = d.id
        AND v."viewerIdentityId" = ${viewer.identityId}
    `);
  }

  /** Likes a reel the profile may see. */
  async like(
    viewer: ReelViewer,
    id: string,
    now = new Date(),
  ): Promise<ReelLikeDto> {
    const reel = await this.prisma.reel.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        identity: visibleReelAuthor(viewer.userId),
      },
      select: { id: true },
    });
    if (!reel) throw reelNotFound();

    const likeCount = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.reelLike.createMany({
        data: [{ reelId: id, identityId: viewer.identityId, createdAt: now }],
        skipDuplicates: true,
      });
      return this.afterChange(tx, id, count > 0 ? 1 : 0);
    });
    return { liked: true, likeCount };
  }

  /** Takes a like back; also works once the reel can't be seen any more. */
  async unlike(viewer: ReelViewer, id: string): Promise<ReelLikeDto> {
    const likeCount = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.reelLike.deleteMany({
        where: { reelId: id, identityId: viewer.identityId },
      });
      return this.afterChange(tx, id, count > 0 ? -1 : 0);
    });
    return { liked: false, likeCount };
  }

  private async afterChange(
    tx: Prisma.TransactionClient,
    id: string,
    change: 1 | -1 | 0,
  ): Promise<number> {
    if (change !== 0) {
      await tx.reel.updateMany({
        where: { id, ...(change < 0 ? { likeCount: { gt: 0 } } : {}) },
        data: { likeCount: { increment: change } },
      });
    }
    const reel = await tx.reel.findUnique({
      where: { id },
      select: { likeCount: true },
    });
    if (!reel) throw reelNotFound();
    return reel.likeCount;
  }
}
