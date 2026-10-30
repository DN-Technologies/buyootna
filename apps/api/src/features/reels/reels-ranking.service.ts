import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { REEL_RANK_BATCH, REEL_RANK_WINDOW_MS } from './reels.constants';
import { reelRankScore } from './utils/rank-score';

/** Whether the feed sorts by score. Off until there's real watch data. */
export const reelsRankedFeed = () => process.env.REELS_RANKED_FEED === 'true';

interface RankRow {
  id: string;
  publishedAt: Date;
  likes: number;
  views: bigint;
  completed: bigint;
}

/**
 * Refreshes every recent reel's score each hour, whether or not the feed is
 * using it yet, so turning ranking on starts from real scores. Per-viewer rows
 * outlive the 90-day window (they're pruned at 180), so the stats are complete.
 */
@Injectable()
export class ReelsRankingService {
  private readonly logger = new Logger(ReelsRankingService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async refresh(now = new Date()): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    let scored = 0;
    try {
      const since = new Date(now.getTime() - REEL_RANK_WINDOW_MS);
      let afterId = '';
      for (;;) {
        const rows = await this.prisma.$queryRaw<RankRow[]>(Prisma.sql`
          SELECT r.id,
                 r."publishedAt",
                 r."likeCount" AS likes,
                 count(v."reelId") AS views,
                 count(v."reelId") FILTER (WHERE v.completed) AS completed
          FROM "Reel" r
          LEFT JOIN "ReelView" v ON v."reelId" = r.id
          WHERE r.status = 'ACTIVE'
            AND r."publishedAt" > ${since.toISOString()}::timestamptz AT TIME ZONE 'UTC'
            AND r.id > ${afterId}
          GROUP BY r.id
          ORDER BY r.id
          LIMIT ${REEL_RANK_BATCH}
        `);
        if (rows.length === 0) break;
        const scores = rows.map((row) =>
          reelRankScore(
            {
              views: Number(row.views),
              completed: Number(row.completed),
              likes: row.likes,
              publishedAt: row.publishedAt,
            },
            now,
          ),
        );
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE "Reel" r SET "rankScore" = d.score
          FROM unnest(${rows.map((row) => row.id)}::text[], ${scores}::float8[])
            AS d(id, score)
          WHERE r.id = d.id
        `);
        scored += rows.length;
        afterId = rows[rows.length - 1].id;
        if (rows.length < REEL_RANK_BATCH) break;
      }
      // Past the window: fades to nothing rather than keeping its last score
      await this.prisma.reel.updateMany({
        where: {
          status: 'ACTIVE',
          publishedAt: { lte: since },
          rankScore: { not: 0 },
        },
        data: { rankScore: 0 },
      });
    } catch (error) {
      this.logger.error('Reel ranking failed', error as Error);
    } finally {
      this.running = false;
    }
    return scored;
  }
}
