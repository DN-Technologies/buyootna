import { BadRequestException } from '@nestjs/common';

import { decodeFeedCursor, encodeFeedCursor } from '../utils/feed-cursor';

const NOW = new Date('2026-10-20T12:00:00.000Z');
const cursor = {
  snapshotAt: new Date('2026-10-20T11:50:00.000Z'),
  tier: 2,
  latest: new Date('2026-10-20T09:15:30.123Z'),
  authorId: '0b6f3a2e-6f5d-4a4b-9e7c-1d2e3f4a5b6c',
};

const raw = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const expectExpired = (fn: () => unknown) => {
  try {
    fn();
    throw new Error('expected a refusal');
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({
      code: 'STORY_CURSOR_EXPIRED',
    });
  }
};

describe('feed cursor', () => {
  it('round-trips', () => {
    expect(decodeFeedCursor(encodeFeedCursor(cursor), NOW)).toEqual(cursor);
  });

  it('a segment cursor round-trips only within its segment', () => {
    const offices = { ...cursor, type: 'OFFICE' as const };
    expect(decodeFeedCursor(encodeFeedCursor(offices), NOW, 'OFFICE')).toEqual(
      offices,
    );
    // From «مكاتب عقارية» into «شركات» or «الكل», and «الكل» into one
    expectExpired(() =>
      decodeFeedCursor(encodeFeedCursor(offices), NOW, 'COMPANY'),
    );
    expectExpired(() => decodeFeedCursor(encodeFeedCursor(offices), NOW));
    expectExpired(() =>
      decodeFeedCursor(encodeFeedCursor(cursor), NOW, 'OFFICE'),
    );
  });

  it('an unknown segment is refused', () => {
    const json = {
      v: 1,
      s: cursor.snapshotAt.toISOString(),
      t: 2,
      l: cursor.latest.toISOString(),
      a: cursor.authorId,
      k: 'INDIVIDUAL',
    };
    expectExpired(() => decodeFeedCursor(raw(json), NOW));
  });

  it('a snapshot older than 30 minutes is refused', () => {
    const old = { ...cursor, snapshotAt: new Date('2026-10-20T11:29:59.000Z') };
    expectExpired(() => decodeFeedCursor(encodeFeedCursor(old), NOW));
  });

  it('a snapshot in the future is refused', () => {
    const future = {
      ...cursor,
      snapshotAt: new Date('2026-10-20T12:00:01.000Z'),
    };
    expectExpired(() => decodeFeedCursor(encodeFeedCursor(future), NOW));
  });

  it.each([
    ['not base64 json', 'not-a-cursor'],
    [
      'wrong version',
      raw({
        v: 2,
        s: cursor.snapshotAt,
        t: 0,
        l: cursor.latest,
        a: cursor.authorId,
      }),
    ],
    [
      'tier out of range',
      raw({
        v: 1,
        s: cursor.snapshotAt,
        t: 4,
        l: cursor.latest,
        a: cursor.authorId,
      }),
    ],
    [
      'fractional tier',
      raw({
        v: 1,
        s: cursor.snapshotAt,
        t: 1.5,
        l: cursor.latest,
        a: cursor.authorId,
      }),
    ],
    [
      'author is not an id',
      raw({
        v: 1,
        s: cursor.snapshotAt,
        t: 0,
        l: cursor.latest,
        a: "x' OR 1=1",
      }),
    ],
    [
      'bad date',
      raw({ v: 1, s: 'yesterday', t: 0, l: cursor.latest, a: cursor.authorId }),
    ],
    ['not an object', raw([1, 2, 3])],
  ])('%s is refused', (_label, value) => {
    expectExpired(() => decodeFeedCursor(value, NOW));
  });
});
