import { BadRequestException } from '@nestjs/common';

import { STORY_CURSOR_MAX_AGE_MS } from '../stories.constants';

/**
 * Where a feed page ended: the snapshot every page of this scroll shares,
 * and the last author's sort key (tier, latest story, author id).
 */
export interface FeedCursor {
  snapshotAt: Date;
  tier: number;
  latest: Date;
  authorId: string;
}

interface CursorJson {
  v: 1;
  s: string;
  t: number;
  l: string;
  a: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeFeedCursor(cursor: FeedCursor): string {
  const json: CursorJson = {
    v: 1,
    s: cursor.snapshotAt.toISOString(),
    t: cursor.tier,
    l: cursor.latest.toISOString(),
    a: cursor.authorId,
  };
  return Buffer.from(JSON.stringify(json)).toString('base64url');
}

function cursorError(): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: 'انتهت صلاحية الصفحة، يرجى تحديث القصص',
    code: 'STORY_CURSOR_EXPIRED',
  });
}

/**
 * Reads a cursor the server issued. A malformed one, or one whose snapshot
 * is older than STORY_CURSOR_MAX_AGE_MS, is refused with
 * STORY_CURSOR_EXPIRED so the app reloads from the first page.
 */
export function decodeFeedCursor(raw: string, now = new Date()): FeedCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw cursorError();
  }
  if (!isCursorJson(parsed)) throw cursorError();

  const snapshotAt = new Date(parsed.s);
  const latest = new Date(parsed.l);
  if (Number.isNaN(snapshotAt.getTime()) || Number.isNaN(latest.getTime())) {
    throw cursorError();
  }
  const age = now.getTime() - snapshotAt.getTime();
  if (age < 0 || age > STORY_CURSOR_MAX_AGE_MS) throw cursorError();

  return { snapshotAt, tier: parsed.t, latest, authorId: parsed.a };
}

function isCursorJson(value: unknown): value is CursorJson {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 1 &&
    typeof v.s === 'string' &&
    typeof v.l === 'string' &&
    typeof v.a === 'string' &&
    UUID.test(v.a) &&
    typeof v.t === 'number' &&
    Number.isInteger(v.t) &&
    v.t >= 0 &&
    v.t <= 3
  );
}
