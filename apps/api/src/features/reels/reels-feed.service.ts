import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { notBlockedSql } from '../blocks/block.rules';
import type { ReelListQueryDto } from './dto/reel-list-query.dto';
import type {
  MyReelsDto,
  ReelFeedDto,
  ViewerReelDto,
} from './dto/reel-response.dto';
import { ReelsMediaService } from './reels-media.service';
import { REEL_PAGE_DEFAULT } from './reels.constants';
import { reelNotFound } from './reels.errors';
import {
  REEL_SELECT,
  toAuthorReelDto,
  toViewerReelDto,
  VIEWER_REEL_SELECT,
  type ViewerReelRow,
  visibleReelAuthor,
} from './reels.mapper';
import {
  decodeReelCursor,
  encodeReelCursor,
  type ReelCursor,
} from './utils/reel-cursor';
import { spreadAuthors } from './utils/spread-authors';

export interface ReelViewer {
  identityId: string;
  userId: string;
}

/** One reel's place in the feed, from the ordering query. */
export interface FeedRankRow {
  id: string;
  identityId: string;
  publishedIso: string;
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
 * Reads of reels. The main feed: a signed-in profile gets what it hasn't seen,
 * newest first, then what it has seen, newest first; a guest gets newest
 * first. Same-author reels are spread out within each page.
 *
 * The scroll's snapshot (the first page's time) fixes what counts as seen and
 * what can appear, so reels don't move between pages. Other changes apply at
 * once and can make a page skip a reel: a deletion, a block, a listing sold.
 *
 * Unseen and seen are two keyset queries on the same index, not a rank worked
 * out over every reel, so a page costs the same however many reels exist.
 */
@Injectable()
export class ReelsFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: ReelsMediaService,
  ) {}

  async feed(
    viewer: ReelViewer | null,
    query: ReelListQueryDto,
    now = new Date(),
  ): Promise<ReelFeedDto> {
    const limit = query.limit ?? REEL_PAGE_DEFAULT;
    const cursor = query.cursor ? decodeReelCursor(query.cursor, now) : null;
    const snapshotAt = cursor?.snapshotAt ?? now;
    const take = limit + 1;

    // A guest has one list, kept in the "unseen" part: nothing to tell apart
    const onSeen = cursor?.seen ?? false;
    const first = await this.prisma.$queryRaw<FeedRankRow[]>(
      feedQuery(viewer, snapshotAt, now, cursor, take, onSeen),
    );
    const firstSeen = onSeen;
    const rest =
      viewer && !onSeen && first.length < take
        ? await this.prisma.$queryRaw<FeedRankRow[]>(
            feedQuery(viewer, snapshotAt, now, null, take - first.length, true),
          )
        : [];
    const ranked = [
      ...first.map((rank) => ({ ...rank, seen: firstSeen })),
      ...rest.map((rank) => ({ ...rank, seen: true })),
    ];

    const page = ranked.slice(0, limit);
    const shown = spreadAuthors(page, cursor?.lastAuthorId);
    const last = page[page.length - 1];
    const nextCursor =
      ranked.length > limit && last
        ? encodeReelCursor({
            snapshotAt,
            seen: last.seen,
            publishedAt: new Date(last.publishedIso),
            id: last.id,
            lastAuthorId: shown[shown.length - 1]?.identityId,
          })
        : null;

    const seen = new Set(page.filter((r) => r.seen).map((r) => r.id));
    const reels = await this.viewerReels(
      viewer,
      shown.map((r) => r.id),
      seen,
      now,
    );
    return { snapshotAt: snapshotAt.toISOString(), reels, nextCursor };
  }

  /**
   * One reel by its link. A sold listing or a lapsed subscription doesn't hide
   * it here, as on the profile; anything else unavailable answers 404.
   */
  async findOne(
    viewer: ReelViewer | null,
    id: string,
    now = new Date(),
  ): Promise<ViewerReelDto> {
    const row = await this.prisma.reel.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        identity: visibleReelAuthor(viewer?.userId),
      },
      select: { id: true },
    });
    if (!row) throw reelNotFound();
    const [reel] = await this.viewerReels(viewer, [row.id], new Set(), now);
    if (!reel) throw reelNotFound();
    return reel;
  }

  /** A company's or office's reels as shown on its profile, newest first. */
  async byAuthor(
    viewer: ReelViewer | null,
    authorId: string,
    query: ReelListQueryDto,
    now = new Date(),
  ): Promise<ReelFeedDto> {
    const limit = query.limit ?? REEL_PAGE_DEFAULT;
    const cursor = query.cursor ? decodeReelCursor(query.cursor, now) : null;
    const snapshotAt = cursor?.snapshotAt ?? now;

    const rows = await this.prisma.reel.findMany({
      where: {
        identityId: authorId,
        status: 'ACTIVE',
        publishedAt: { lte: snapshotAt },
        identity: visibleReelAuthor(viewer?.userId),
        ...(cursor ? afterCursor(cursor) : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      select: { id: true, publishedAt: true },
    });
    const page = rows.slice(0, limit);
    const reels = await this.viewerReels(
      viewer,
      page.map((r) => r.id),
      new Set(),
      now,
    );
    return {
      snapshotAt: snapshotAt.toISOString(),
      reels,
      nextCursor: this.nextCursor(rows, limit, snapshotAt),
    };
  }

  /** The author's own published reels with their counts, newest first. */
  async mine(
    identityId: string,
    query: ReelListQueryDto,
    now = new Date(),
  ): Promise<MyReelsDto> {
    const limit = query.limit ?? REEL_PAGE_DEFAULT;
    const cursor = query.cursor ? decodeReelCursor(query.cursor, now) : null;
    const rows = await this.prisma.reel.findMany({
      where: {
        identityId,
        status: 'ACTIVE',
        ...(cursor ? afterCursor(cursor) : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      select: REEL_SELECT,
    });
    return {
      reels: rows
        .slice(0, limit)
        .map((r) => toAuthorReelDto(r, this.media.linksFor(r), now)),
      nextCursor: this.nextCursor(rows, limit, cursor?.snapshotAt ?? now),
    };
  }

  private nextCursor(
    rows: { id: string; publishedAt: Date | null }[],
    limit: number,
    snapshotAt: Date,
  ): string | null {
    const last = rows.slice(0, limit).pop();
    return rows.length > limit && last?.publishedAt
      ? encodeReelCursor({
          snapshotAt,
          seen: false,
          publishedAt: last.publishedAt,
          id: last.id,
        })
      : null;
  }

  /** The reels in this order, with what this caller did with them. */
  private async viewerReels(
    viewer: ReelViewer | null,
    ids: string[],
    seen: Set<string>,
    now: Date,
  ): Promise<ViewerReelDto[]> {
    if (ids.length === 0) return [];
    const [rows, likes] = await Promise.all([
      this.prisma.reel.findMany({
        where: { id: { in: ids } },
        select: VIEWER_REEL_SELECT,
      }),
      viewer
        ? this.prisma.reelLike.findMany({
            where: { identityId: viewer.identityId, reelId: { in: ids } },
            select: { reelId: true },
          })
        : Promise.resolve<{ reelId: string }[]>([]),
    ]);
    const byId = new Map<string, ViewerReelRow>(rows.map((r) => [r.id, r]));
    const liked = new Set(likes.map((l) => l.reelId));
    return ids.flatMap((id) => {
      const row = byId.get(id);
      // Gone between the queries: left out of this page
      if (!row) return [];
      const dto = toViewerReelDto(row, this.media.linksFor(row), now, {
        liked: liked.has(id),
        viewed: seen.has(id),
      });
      return dto ? [dto] : [];
    });
  }
}

/** Reels after the cursor, in newest-first order. */
function afterCursor(cursor: ReelCursor): Prisma.ReelWhereInput {
  return {
    OR: [
      { publishedAt: { lt: cursor.publishedAt } },
      { publishedAt: cursor.publishedAt, id: { lt: cursor.id } },
    ],
  };
}

/**
 * The ordering query for one part of the feed. Reels: published by the
 * snapshot, from an approved company with a running subscription or an
 * approved office, whose account is neither disabled nor blocked. A reel
 * published with a listing shows only while that listing can be shown to the
 * public. For a signed-in viewer: not its own account's reels, no block either
 * way, and only the seen or only the unseen ones.
 */
export function feedQuery(
  viewer: ReelViewer | null,
  snapshotAt: Date,
  now: Date,
  cursor: ReelCursor | null,
  take: number,
  seen: boolean,
): Prisma.Sql {
  const after = cursor
    ? Prisma.sql`AND (r."publishedAt", r.id) < (${utc(cursor.publishedAt)}, ${cursor.id})`
    : Prisma.empty;
  const forViewer = viewer
    ? Prisma.sql`
        AND i."userId" <> ${viewer.userId}
        AND ${notBlockedSql(viewer.userId, Prisma.sql`i."userId"`)}
        AND ${seen ? Prisma.sql`EXISTS` : Prisma.sql`NOT EXISTS`} (
          SELECT 1 FROM "ReelView" v
          WHERE v."reelId" = r.id
            AND v."viewerIdentityId" = ${viewer.identityId}
            AND v."viewedAt" <= ${utc(snapshotAt)}
        )`
    : Prisma.empty;

  return Prisma.sql`
    SELECT r.id,
           r."identityId",
           to_char(r."publishedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "publishedIso"
    FROM "Reel" r
    JOIN "Identity" i ON i.id = r."identityId"
    JOIN "User" u ON u.id = i."userId"
    LEFT JOIN "CompanyIdentityData" c ON c."identityId" = i.id
    LEFT JOIN "OfficeIdentityData" o ON o."identityId" = i.id
    LEFT JOIN "Property" p ON p.id = r."propertyId"
    WHERE r.status = 'ACTIVE'
      AND r."publishedAt" <= ${utc(snapshotAt)}
      AND u."isDisabled" = false
      AND u."isBlocked" = false
      AND ((i.type = 'COMPANY' AND c.status = 'APPROVED' AND EXISTS (
              SELECT 1 FROM "CompanySubscription" cs
              WHERE cs."identityId" = i.id AND cs."endsAt" > ${utc(now)}
            ))
        OR (i.type = 'OFFICE' AND o.status = 'APPROVED'))
      AND (r."hadListing" = false OR (
            p."identityId" = r."identityId"
        AND p.status = 'ACTIVE'
        AND p."isHidden" = false
        AND (p."endDate" IS NULL OR p."endDate" > ${utc(now)})
      ))
      ${forViewer}
      ${after}
    ORDER BY r."publishedAt" DESC, r.id DESC
    LIMIT ${take}
  `;
}
