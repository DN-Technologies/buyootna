import { BadRequestException } from '@nestjs/common';

import { decodeReelCursor, encodeReelCursor } from '../utils/reel-cursor';
import { reelRankScore } from '../utils/rank-score';
import { spreadAuthors } from '../utils/spread-authors';

const NOW = new Date('2026-10-30T12:00:00.000Z');
const ID = '22222222-2222-4222-8222-222222222222';
const AUTHOR = '11111111-1111-4111-8111-111111111111';
const HOUR = 3600 * 1000;

describe('reel cursor', () => {
  const cursor = {
    snapshotAt: new Date(NOW.getTime() - HOUR),
    tier: 2,
    publishedAt: new Date(NOW.getTime() - 2 * HOUR),
    id: ID,
    lastAuthorId: AUTHOR,
  };
  const forge = (json: unknown) =>
    Buffer.from(JSON.stringify(json)).toString('base64url');

  it('reads back what it wrote', () => {
    expect(decodeReelCursor(encodeReelCursor(cursor), NOW)).toEqual(cursor);
  });

  it("lasts 6 hours, so a long session isn't interrupted", () => {
    const old = encodeReelCursor({
      ...cursor,
      snapshotAt: new Date(NOW.getTime() - 5.9 * HOUR),
    });
    expect(decodeReelCursor(old, NOW).tier).toBe(2);
    const expired = encodeReelCursor({
      ...cursor,
      snapshotAt: new Date(NOW.getTime() - 6.1 * HOUR),
    });
    expect(() => decodeReelCursor(expired, NOW)).toThrow(BadRequestException);
  });

  it.each([
    ['not base64 json', '%%%'],
    ['another version', forge({ v: 1 })],
    [
      'an impossible tier',
      forge({ v: 2, s: NOW.toISOString(), t: 4, p: NOW.toISOString(), i: ID }),
    ],
    [
      'an id that could reach the query',
      forge({
        v: 2,
        s: NOW.toISOString(),
        t: 0,
        p: NOW.toISOString(),
        i: "x' OR 1=1",
      }),
    ],
    [
      'a bad date',
      forge({ v: 2, s: 'nope', t: 0, p: NOW.toISOString(), i: ID }),
    ],
  ])('refuses %s', (_name, raw) => {
    expect(() => decodeReelCursor(raw, NOW)).toThrow(BadRequestException);
  });

  it('belongs to the filters it was made under', () => {
    const raw = encodeReelCursor({ ...cursor, filterKey: 'capital||SALE' });
    expect(decodeReelCursor(raw, NOW, 'capital||SALE').filterKey).toBe(
      'capital||SALE',
    );
    expect(() => decodeReelCursor(raw, NOW, 'capital||RENT')).toThrow(
      BadRequestException,
    );
    expect(() => decodeReelCursor(raw, NOW)).toThrow(BadRequestException);
    expect(() =>
      decodeReelCursor(encodeReelCursor(cursor), NOW, 'capital||SALE'),
    ).toThrow(BadRequestException);
  });

  it('refuses a snapshot from the future', () => {
    const future = encodeReelCursor({
      ...cursor,
      snapshotAt: new Date(NOW.getTime() + HOUR),
    });
    expect(() => decodeReelCursor(future, NOW)).toThrow(BadRequestException);
  });
});

describe('reelRankScore', () => {
  const NOW_ = new Date('2026-10-30T12:00:00.000Z');
  const score = (
    over: Partial<Parameters<typeof reelRankScore>[0]> = {},
  ): number =>
    reelRankScore(
      { views: 0, completed: 0, likes: 0, publishedAt: NOW_, ...over },
      NOW_,
    );
  const daysAgo = (days: number) =>
    new Date(NOW_.getTime() - days * 24 * 3600 * 1000);

  it('a brand new reel gets the average', () => {
    expect(score()).toBeCloseTo(0.4);
  });

  it('a few early views cannot swing it to an extreme', () => {
    expect(score({ views: 1, completed: 1, likes: 1 })).toBeLessThan(0.65);
    expect(score({ views: 1 })).toBeGreaterThan(0.3);
  });

  it('a reel people finish and like beats one they do not', () => {
    const good = score({ views: 200, completed: 160, likes: 40 });
    const poor = score({ views: 200, completed: 10, likes: 1 });
    expect(good).toBeGreaterThan(poor);
    expect(good).toBeGreaterThan(score());
    expect(poor).toBeLessThan(score());
  });

  it('fades with age: about 37% after a week', () => {
    expect(score({ publishedAt: daysAgo(7) }) / score()).toBeCloseTo(0.368, 2);
  });

  it('a new reel can beat an old good one, but not a recent great one', () => {
    const newReel = score();
    expect(
      score({
        views: 500,
        completed: 400,
        likes: 100,
        publishedAt: daysAgo(30),
      }),
    ).toBeLessThan(newReel);
    expect(
      score({
        views: 500,
        completed: 400,
        likes: 100,
        publishedAt: daysAgo(1),
      }),
    ).toBeGreaterThan(newReel);
  });

  it('a date in the future counts as new', () => {
    expect(score({ publishedAt: daysAgo(-1) })).toBeCloseTo(score());
  });
});

describe('spreadAuthors', () => {
  const reels = (authors: string) =>
    [...authors].map((identityId, i) => ({ identityId, i }));
  const order = (authors: string, last?: string) =>
    spreadAuthors(reels(authors), last)
      .map((r) => r.identityId)
      .join('');

  it('leaves a varied page as it is', () => {
    expect(order('abc')).toBe('abc');
  });

  it('separates an author wherever it can', () => {
    expect(order('aab')).toBe('aba');
    expect(order('aabbcc')).toBe('ababcc');
  });

  it("keeps every reel when one author can't be separated", () => {
    expect(order('aaaa')).toBe('aaaa');
    expect(order('aaab')).toBe('abaa');
  });

  it("doesn't start with the author the last page ended on", () => {
    expect(order('ab', 'a')).toBe('ba');
  });

  it('handles an empty page', () => {
    expect(spreadAuthors([])).toEqual([]);
  });
});
