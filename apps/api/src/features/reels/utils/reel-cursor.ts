import { BadRequestException } from '@nestjs/common';

import { REEL_CURSOR_MAX_AGE_MS } from '../reels.constants';

/**
 * Where a page ended: the snapshot every page of this scroll shares, and the
 * last reel's sort key. `seen` says the scroll has moved on from the unseen
 * reels to the seen ones (feed only). `lastAuthorId` is who was shown last,
 * so the next page doesn't start with the same author.
 */
export interface ReelCursor {
  snapshotAt: Date;
  seen: boolean;
  publishedAt: Date;
  id: string;
  lastAuthorId?: string;
}

interface CursorJson {
  v: 1;
  s: string;
  n: boolean;
  p: string;
  i: string;
  a?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeReelCursor(cursor: ReelCursor): string {
  const json: CursorJson = {
    v: 1,
    s: cursor.snapshotAt.toISOString(),
    n: cursor.seen,
    p: cursor.publishedAt.toISOString(),
    i: cursor.id,
    ...(cursor.lastAuthorId ? { a: cursor.lastAuthorId } : {}),
  };
  return Buffer.from(JSON.stringify(json)).toString('base64url');
}

function cursorError(): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: 'انتهت صلاحية الصفحة، يرجى تحديث الفيديوهات',
    code: 'REEL_CURSOR_EXPIRED',
  });
}

/**
 * Reads a cursor the server issued. A malformed one, or one whose snapshot is
 * older than REEL_CURSOR_MAX_AGE_MS, is refused with REEL_CURSOR_EXPIRED: the
 * app starts again from the first page and drops what it already showed.
 */
export function decodeReelCursor(raw: string, now = new Date()): ReelCursor {
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

  return {
    snapshotAt,
    seen: parsed.n,
    publishedAt,
    id: parsed.i,
    ...(parsed.a ? { lastAuthorId: parsed.a } : {}),
  };
}

function isCursorJson(value: unknown): value is CursorJson {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 1 &&
    typeof v.s === 'string' &&
    typeof v.n === 'boolean' &&
    typeof v.p === 'string' &&
    typeof v.i === 'string' &&
    UUID.test(v.i) &&
    (v.a === undefined || (typeof v.a === 'string' && UUID.test(v.a)))
  );
}
