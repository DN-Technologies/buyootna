import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import type { FeedAuthorDto, StoryFeedDto } from './dto/story-response.dto';
import { StoryFeedQueryDto } from './dto/story-feed-query.dto';
import { StoriesMediaService } from './stories-media.service';
import { STORY_FEED_DEFAULT_LIMIT } from './stories.constants';
import {
  AUTHOR_SELECT,
  firstUnseenIndex,
  liveStoryWhere,
  STORY_SELECT,
  toAuthorDto,
  toViewerStoryDto,
} from './stories.mapper';
import {
  decodeFeedCursor,
  encodeFeedCursor,
  type FeedCursor,
} from './utils/feed-cursor';

export interface FeedViewer {
  identityId: string;
  userId: string;
}

/** One author's place in the feed, from the ordering query. */
export interface FeedRankRow {
  authorId: string;
  latestIso: string;
  hasUnseen: boolean;
  followed: boolean;
  tier: number;
}

/**
 * A timestamp parameter for a timestamp(3) column (stored as UTC): sent as
 * ISO text and cast explicitly, so neither the driver nor the server's time
 * zone can shift it.
 */
function utc(date: Date): Prisma.Sql {
  return Prisma.sql`(${date.toISOString()}::timestamptz AT TIME ZONE 'UTC')`;
}

/**
 * The stories feed: authors ordered so unseen always comes first, and within
 * unseen and within seen the followed providers come first:
 *
 *   tier 0 unseen + followed, 1 unseen, 2 seen + followed, 3 seen
 *   ORDER BY tier, latest story DESC, author id   (the id makes it total)
 *
 * The scroll's snapshot (the first page's time) fixes what counts as seen
 * and as followed: views and follows made after it are ignored, so they
 * don't move authors between pages. Other changes during a scroll apply
 * at once and can make a page skip or repeat an author: an unfollow (its
 * row is gone), an approval or account-status change, and a story deleted
 * or expiring (which can also change the author's latest story).
 * Pull-to-refresh starts a new snapshot.
 *
 * Four queries per page whatever its size: the ordering, the authors, their
 * stories, and the viewer's views of them.
 */
@Injectable()
export class StoriesFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: StoriesMediaService,
  ) {}

  async feed(
    viewer: FeedViewer,
    query: StoryFeedQueryDto,
    now = new Date(),
  ): Promise<StoryFeedDto> {
    const limit = query.limit ?? STORY_FEED_DEFAULT_LIMIT;
    const cursor = query.cursor ? decodeFeedCursor(query.cursor, now) : null;
    const snapshotAt = cursor?.snapshotAt ?? now;

    const ranked = await this.prisma.$queryRaw<FeedRankRow[]>(
      rankQuery(viewer, snapshotAt, now, cursor, limit + 1),
    );
    const page = ranked.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor =
      ranked.length > limit && last
        ? encodeFeedCursor({
            snapshotAt,
            tier: last.tier,
            latest: new Date(last.latestIso),
            authorId: last.authorId,
          })
        : null;
    if (page.length === 0) {
      return { snapshotAt: snapshotAt.toISOString(), authors: [], nextCursor };
    }

    const ids = page.map((r) => r.authorId);
    const [authors, rows] = await Promise.all([
      this.prisma.identity.findMany({
        where: { id: { in: ids } },
        select: AUTHOR_SELECT,
      }),
      this.prisma.story.findMany({
        where: {
          identityId: { in: ids },
          ...liveStoryWhere(now),
          publishedAt: { lte: snapshotAt },
        },
        select: STORY_SELECT,
        orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
      }),
    ]);
    const views = rows.length
      ? await this.prisma.storyView.findMany({
          where: {
            viewerIdentityId: viewer.identityId,
            storyId: { in: rows.map((r) => r.id) },
            viewedAt: { lte: snapshotAt },
          },
          select: { storyId: true },
        })
      : [];
    const seen = new Set(views.map((v) => v.storyId));
    const authorById = new Map(authors.map((a) => [a.id, a]));

    const result: FeedAuthorDto[] = [];
    for (const rank of page) {
      const authorRow = authorById.get(rank.authorId);
      const author = authorRow ? toAuthorDto(authorRow) : null;
      const own = rows.filter((r) => r.identityId === rank.authorId);
      // Gone between the queries (deleted, expired): left out of this page
      if (!author || own.length === 0) continue;
      const stories = await Promise.all(
        own.map(async (row) =>
          toViewerStoryDto(
            row,
            await this.media.linksFor(row, now),
            seen.has(row.id),
          ),
        ),
      );
      result.push({
        author,
        followed: rank.followed,
        hasUnseen: rank.hasUnseen,
        latestPublishedAt: rank.latestIso,
        firstUnseenIndex: firstUnseenIndex(stories),
        stories,
      });
    }
    return {
      snapshotAt: snapshotAt.toISOString(),
      authors: result,
      nextCursor,
    };
  }
}

/**
 * The ordering query. Authors: approved companies and offices with a live
 * story published by the snapshot, owned by an account that is neither
 * disabled nor blocked, and not the viewer's own account (none of its
 * profiles).
 */
export function rankQuery(
  viewer: FeedViewer,
  snapshotAt: Date,
  now: Date,
  cursor: FeedCursor | null,
  take: number,
): Prisma.Sql {
  const after = cursor
    ? Prisma.sql`WHERE r.tier > ${cursor.tier}
        OR (r.tier = ${cursor.tier} AND r.latest < ${utc(cursor.latest)})
        OR (r.tier = ${cursor.tier} AND r.latest = ${utc(cursor.latest)}
            AND r."authorId" > ${cursor.authorId})`
    : Prisma.empty;

  return Prisma.sql`
    WITH live AS (
      SELECT s.id, s."identityId", s."publishedAt"
      FROM "Story" s
      JOIN "Identity" i ON i.id = s."identityId"
      JOIN "User" u ON u.id = i."userId"
      LEFT JOIN "CompanyIdentityData" c ON c."identityId" = i.id
      LEFT JOIN "OfficeIdentityData" o ON o."identityId" = i.id
      WHERE s.status = 'ACTIVE'
        AND s."expiresAt" > ${utc(now)}
        AND s."publishedAt" <= ${utc(snapshotAt)}
        AND i."userId" <> ${viewer.userId}
        AND u."isDisabled" = false
        AND u."isBlocked" = false
        AND ((i.type = 'COMPANY' AND c.status = 'APPROVED')
          OR (i.type = 'OFFICE' AND o.status = 'APPROVED'))
    ),
    authors AS (
      SELECT l."identityId" AS "authorId",
             max(l."publishedAt") AS latest,
             bool_or(v."storyId" IS NULL) AS "hasUnseen"
      FROM live l
      LEFT JOIN "StoryView" v
        ON v."storyId" = l.id
       AND v."viewerIdentityId" = ${viewer.identityId}
       AND v."viewedAt" <= ${utc(snapshotAt)}
      GROUP BY l."identityId"
    ),
    r AS (
      SELECT a."authorId", a.latest, a."hasUnseen",
             (f.id IS NOT NULL) AS followed,
             ((CASE WHEN a."hasUnseen" THEN 0 ELSE 2 END)
               + (CASE WHEN f.id IS NOT NULL THEN 0 ELSE 1 END))::int AS tier
      FROM authors a
      LEFT JOIN "ProviderFavorite" f
        ON f."identityId" = ${viewer.identityId}
       AND f."providerId" = a."authorId"
       AND f."createdAt" <= ${utc(snapshotAt)}
    )
    SELECT r."authorId",
           to_char(r.latest, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "latestIso",
           r."hasUnseen",
           r.followed,
           r.tier
    FROM r
    ${after}
    ORDER BY r.tier ASC, r.latest DESC, r."authorId" ASC
    LIMIT ${take}
  `;
}
