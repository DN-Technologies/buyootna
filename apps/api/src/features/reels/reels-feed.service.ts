import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../core/prisma/prisma.service';
import { notBlockedSql } from '../blocks/block.rules';
import type { ReelFeedQueryDto } from './dto/reel-feed-query.dto';
import type { ReelListQueryDto } from './dto/reel-list-query.dto';
import type {
  MyReelsDto,
  ReelFeedDto,
  ViewerReelDto,
} from './dto/reel-response.dto';
import { ReelsMediaService } from './reels-media.service';
import { reelsRankedFeed } from './reels-ranking.service';
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
  cursorError,
  decodeReelCursor,
  encodeReelCursor,
  type ReelCursor,
} from './utils/reel-cursor';
import { spreadAuthors } from './utils/spread-authors';

export interface ReelViewer {
  identityId: string;
  userId: string;
}

/** What the main feed can be narrowed to, by the reel's listing. */
export interface ReelFilters {
  governorateId?: string;
  areaId?: string;
  listingType?: string;
}

/** One text for a set of filters, or undefined for none. */
export function reelFilterKey(filters: ReelFilters): string | undefined {
  const { governorateId, areaId, listingType } = filters;
  return governorateId || areaId || listingType
    ? [governorateId ?? '', areaId ?? '', listingType ?? ''].join('|')
    : undefined;
}

/** One reel's place in the feed, from the ordering query. */
export interface FeedRankRow {
  id: string;
  identityId: string;
  publishedIso: string;
  rankScore: number;
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
 * Reads of reels. The main feed: a signed-in profile gets four parts, each
 * newest first, as the stories feed orders its authors:
 *
 *   tier 0 unseen + followed, 1 unseen, 2 seen + followed, 3 seen
 *
 * A guest gets newest first. Same-author reels are spread out within each page.
 *
 * The scroll's snapshot (the first page's time) fixes what counts as seen and
 * as followed and what can appear, so reels don't move between pages. Other changes apply at
 * once and can make a page skip a reel: a deletion, a block, a listing sold.
 *
 * The parts are keyset queries on the same index, not a rank worked out over
 * every reel, so a page costs about the same however many reels exist.
 */
@Injectable()
export class ReelsFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: ReelsMediaService,
  ) {}

  async feed(
    viewer: ReelViewer | null,
    query: ReelFeedQueryDto,
    now = new Date(),
  ): Promise<ReelFeedDto> {
    const limit = query.limit ?? REEL_PAGE_DEFAULT;
    const filterKey = reelFilterKey(query);
    const cursor = query.cursor
      ? decodeReelCursor(query.cursor, now, filterKey)
      : null;
    const snapshotAt = cursor?.snapshotAt ?? now;
    const take = limit + 1;
    const rankedFeed = reelsRankedFeed();
    // Ranking turned on mid-scroll: this cursor can't say where it was
    if (cursor && rankedFeed && cursor.rankScore === undefined)
      throw cursorError();

    // A guest has one list, kept in tier 0: nothing to tell apart
    const lastTier = viewer ? 3 : 0;
    const ranked: (FeedRankRow & { tier: number })[] = [];
    for (let tier = cursor?.tier ?? 0; tier <= lastTier; tier += 1) {
      const rows = await this.prisma.$queryRaw<FeedRankRow[]>(
        feedQuery(
          viewer,
          snapshotAt,
          now,
          // The cursor only applies in the part it stopped in
          tier === cursor?.tier ? cursor : null,
          take - ranked.length,
          tier,
          query,
          rankedFeed,
        ),
      );
      ranked.push(...rows.map((row) => ({ ...row, tier })));
      if (ranked.length >= take) break;
    }

    const page = ranked.slice(0, limit);
    const shown = spreadAuthors(page, cursor?.lastAuthorId);
    const last = page[page.length - 1];
    const nextCursor =
      ranked.length > limit && last
        ? encodeReelCursor({
            snapshotAt,
            tier: last.tier,
            publishedAt: new Date(last.publishedIso),
            id: last.id,
            ...(rankedFeed ? { rankScore: last.rankScore } : {}),
            lastAuthorId: shown[shown.length - 1]?.identityId,
            filterKey,
          })
        : null;

    const seen = new Set(page.filter((r) => r.tier >= 2).map((r) => r.id));
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
          tier: 0,
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
    const [rows, likes, follows] = await Promise.all([
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
      viewer
        ? this.prisma.providerFavorite.findMany({
            where: { identityId: viewer.identityId },
            select: { providerId: true },
          })
        : Promise.resolve<{ providerId: string }[]>([]),
    ]);
    const byId = new Map<string, ViewerReelRow>(rows.map((r) => [r.id, r]));
    const liked = new Set(likes.map((l) => l.reelId));
    const followed = new Set(follows.map((f) => f.providerId));
    return ids.flatMap((id) => {
      const row = byId.get(id);
      // Gone between the queries: left out of this page
      if (!row) return [];
      const dto = toViewerReelDto(row, this.media.linksFor(row), now, {
        liked: liked.has(id),
        viewed: seen.has(id),
        followed: followed.has(row.identityId),
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
 * way, and only that tier's reels. A filter keeps reels whose
 * listing matches, which leaves out reels with no listing.
 */
export function feedQuery(
  viewer: ReelViewer | null,
  snapshotAt: Date,
  now: Date,
  cursor: ReelCursor | null,
  take: number,
  tier: number,
  filters: ReelFilters = {},
  ranked = false,
): Prisma.Sql {
  const after = cursor
    ? ranked
      ? Prisma.sql`AND (r."rankScore", r.id) < (${cursor.rankScore ?? 0}::float8, ${cursor.id})`
      : Prisma.sql`AND (r."publishedAt", r.id) < (${utc(cursor.publishedAt)}, ${cursor.id})`
    : Prisma.empty;
  const filtered = reelFilterKey(filters)
    ? Prisma.sql`
        AND p.id IS NOT NULL
        ${filters.governorateId ? Prisma.sql`AND p."governorateId" = ${filters.governorateId}` : Prisma.empty}
        ${filters.areaId ? Prisma.sql`AND p."areaId" = ${filters.areaId}` : Prisma.empty}
        ${filters.listingType ? Prisma.sql`AND p.type::text = ${filters.listingType}` : Prisma.empty}`
    : Prisma.empty;
  const forViewer = viewer
    ? Prisma.sql`
        AND i."userId" <> ${viewer.userId}
        AND ${notBlockedSql(viewer.userId, Prisma.sql`i."userId"`)}
        AND ${tier >= 2 ? Prisma.sql`EXISTS` : Prisma.sql`NOT EXISTS`} (
          SELECT 1 FROM "ReelView" v
          WHERE v."reelId" = r.id
            AND v."viewerIdentityId" = ${viewer.identityId}
            AND v."viewedAt" <= ${utc(snapshotAt)}
        )
        AND ${tier % 2 === 0 ? Prisma.sql`EXISTS` : Prisma.sql`NOT EXISTS`} (
          SELECT 1 FROM "ProviderFavorite" f
          WHERE f."identityId" = ${viewer.identityId}
            AND f."providerId" = r."identityId"
            AND f."createdAt" <= ${utc(snapshotAt)}
        )`
    : Prisma.empty;

  return Prisma.sql`
    SELECT r.id,
           r."identityId",
           to_char(r."publishedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "publishedIso",
           r."rankScore"
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
      ${filtered}
      ${forViewer}
      ${after}
    ORDER BY ${ranked ? Prisma.sql`r."rankScore" DESC` : Prisma.sql`r."publishedAt" DESC`}, r.id DESC
    LIMIT ${take}
  `;
}
