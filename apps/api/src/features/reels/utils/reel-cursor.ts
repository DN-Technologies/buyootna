import { BadRequestException } from '@nestjs/common';

import { REEL_CURSOR_MAX_AGE_MS } from '../reels.constants';

/**
 * Where a page ended: the snapshot every page of this scroll shares, and the
 * last reel's sort key. `tier` is the part of the feed it's in (feed only:
 * 0 unseen and followed, 1 unseen, 2 seen and followed, 3 seen). `lastAuthorId`
 * is who was shown last, so the next page doesn't start with the same author.
 */
export interface ReelCursor {
  snapshotAt: Date;
  tier: number;
  publishedAt: Date;
  id: string;
  // The last reel's score, when the feed is ranked
  rankScore?: number;
  lastAuthorId?: string;
  // The filters the scroll is under, if any (see reelFilterKey)
  filterKey?: string;
}

interface CursorJson {
  v: 2;
  s: string;
  t: number;
  p: string;
  i: string;
  r?: number;
  a?: string;
  f?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeReelCursor(cursor: ReelCursor): string {
  const json: CursorJson = {
    v: 2,
    s: cursor.snapshotAt.toISOString(),
    t: cursor.tier,
    p: cursor.publishedAt.toISOString(),
    i: cursor.id,
    ...(cursor.rankScore !== undefined ? { r: cursor.rankScore } : {}),
    ...(cursor.lastAuthorId ? { a: cursor.lastAuthorId } : {}),
    ...(cursor.filterKey ? { f: cursor.filterKey } : {}),
  };
  return Buffer.from(JSON.stringify(json)).toString('base64url');
}

export function cursorError(): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: 'انتهت صلاحية الصفحة، يرجى تحديث الفيديوهات',
    code: 'REEL_CURSOR_EXPIRED',
  });
}

/**
 * Reads a cursor the server issued. A malformed one, or one whose snapshot is
 * older than REEL_CURSOR_MAX_AGE_MS, or one made under other filters, is
 * refused with REEL_CURSOR_EXPIRED: the app starts again from the first page
 * and drops what it already showed.
 */
export function decodeReelCursor(
  raw: string,
  now = new Date(),
  filterKey?: string,
): ReelCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw cursorError();
  }
  if (!isCursorJson(parsed)) throw cursorError();

  const snapshotAt = new Date(parsed.s);
  const publishedAt = new Date(parsed.p);
  if (
    Number.isNaN(snapshotAt.getTime()) ||
    Number.isNaN(publishedAt.getTime())
  ) {
    throw cursorError();
  }
  const age = now.getTime() - snapshotAt.getTime();
  if (age < 0 || age > REEL_CURSOR_MAX_AGE_MS) throw cursorError();
  if ((parsed.f ?? undefined) !== filterKey) throw cursorError();

  return {
    snapshotAt,
    tier: parsed.t,
    publishedAt,
    id: parsed.i,
    ...(parsed.r !== undefined ? { rankScore: parsed.r } : {}),
    ...(parsed.a ? { lastAuthorId: parsed.a } : {}),
    ...(parsed.f ? { filterKey: parsed.f } : {}),
  };
}

function isCursorJson(value: unknown): value is CursorJson {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 2 &&
    typeof v.s === 'string' &&
    typeof v.t === 'number' &&
    Number.isInteger(v.t) &&
    v.t >= 0 &&
    v.t <= 3 &&
    typeof v.p === 'string' &&
    typeof v.i === 'string' &&
    UUID.test(v.i) &&
    (v.a === undefined || (typeof v.a === 'string' && UUID.test(v.a))) &&
    (v.r === undefined || (typeof v.r === 'number' && Number.isFinite(v.r))) &&
    (v.f === undefined || typeof v.f === 'string')
  );
}
