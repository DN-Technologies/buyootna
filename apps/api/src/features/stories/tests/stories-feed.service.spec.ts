import { BadRequestException } from '@nestjs/common';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { StoriesFeedService, rankQuery } from '../stories-feed.service';
import { StoriesMediaService } from '../stories-media.service';
import { decodeFeedCursor, encodeFeedCursor } from '../utils/feed-cursor';
import { callArg } from './test-utils';

const NOW = new Date('2026-10-20T12:00:00.000Z');
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const VIEWER = { identityId: id(1), userId: id(2) };
const A = id(10);
const B = id(20);

const author = (n: string, name: string) => ({
  id: n,
  type: 'COMPANY',
  companyData: {
    name,
    logoUrl: null,
    isVerified: false,
    specialty: 'مكتب هندسي',
    servicesHidden: false,
  },
  officeData: null,
});
const story = (storyId: string, identityId: string) => ({
  id: storyId,
  identityId,
  mediaType: 'IMAGE',
  mediaKey: `stories/${identityId}/${storyId}/media.jpg`,
  posterKey: null,
  width: 1,
  height: 1,
  durationMs: null,
  caption: null,
  publishedAt: new Date('2026-10-20T10:00:00.000Z'),
  expiresAt: new Date('2026-10-21T10:00:00.000Z'),
  property: null,
});

describe('StoriesFeedService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    identity: { findMany: jest.fn() },
    story: { findMany: jest.fn() },
    storyView: { findMany: jest.fn() },
  };
  const media = {
    linksFor: jest.fn().mockResolvedValue({
      mediaUrl: 'https://s3.example/get',
      posterUrl: null,
      urlExpiresAt: new Date('2026-10-20T13:00:00.000Z'),
    }),
  };
  const service = new StoriesFeedService(
    prisma as unknown as PrismaService,
    media as unknown as StoriesMediaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$queryRaw.mockResolvedValue([
      {
        authorId: A,
        latestIso: '2026-10-20T10:00:00.000Z',
        hasUnseen: true,
        followed: true,
        tier: 0,
      },
      {
        authorId: B,
        latestIso: '2026-10-20T09:00:00.000Z',
        hasUnseen: false,
        followed: false,
        tier: 3,
      },
    ]);
    prisma.identity.findMany.mockResolvedValue([
      author(A, 'أ'),
      author(B, 'ب'),
    ]);
    prisma.story.findMany.mockResolvedValue([
      story(id(100), A),
      story(id(101), A),
      story(id(200), B),
    ]);
    prisma.storyView.findMany.mockResolvedValue([{ storyId: id(200) }]);
  });

  it('builds a page in four queries, keeping the ranking order', async () => {
    const result = await service.feed(VIEWER, {}, NOW);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.identity.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.story.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.storyView.findMany).toHaveBeenCalledTimes(1);

    expect(result.snapshotAt).toBe(NOW.toISOString());
    expect(result.nextCursor).toBeNull();
    expect(result.authors.map((a) => a.author.identityId)).toEqual([A, B]);
    expect(result.authors[0]).toMatchObject({
      followed: true,
      hasUnseen: true,
      firstUnseenIndex: 0,
      latestPublishedAt: '2026-10-20T10:00:00.000Z',
    });
    expect(result.authors[0].stories).toHaveLength(2);
    expect(result.authors[1].stories[0].viewed).toBe(true);
  });

  it('stories and views are judged as of the snapshot', async () => {
    await service.feed(VIEWER, {}, NOW);
    expect(
      callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(prisma.story.findMany).where,
    ).toEqual({
      identityId: { in: [A, B] },
      status: 'ACTIVE',
      expiresAt: { gt: NOW },
      publishedAt: { lte: NOW },
    });
    expect(
      callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(prisma.storyView.findMany).where,
    ).toMatchObject({
      viewerIdentityId: VIEWER.identityId,
      viewedAt: { lte: NOW },
    });
  });

  it('asks for one extra row and returns a cursor when there is more', async () => {
    const result = await service.feed(VIEWER, { limit: 1 }, NOW);
    const sql = callArg<{ values: unknown[] }>(prisma.$queryRaw);
    expect(sql.values[sql.values.length - 1]).toBe(2);

    expect(result.authors).toHaveLength(1);
    const cursor = decodeFeedCursor(result.nextCursor ?? '', NOW);
    expect(cursor).toEqual({
      snapshotAt: NOW,
      tier: 0,
      latest: new Date('2026-10-20T10:00:00.000Z'),
      authorId: A,
    });
  });

  it('later pages keep the first page snapshot', async () => {
    const snapshotAt = new Date('2026-10-20T11:50:00.000Z');
    const cursor = encodeFeedCursor({
      snapshotAt,
      tier: 0,
      latest: new Date('2026-10-20T10:00:00.000Z'),
      authorId: A,
    });
    const result = await service.feed(VIEWER, { cursor }, NOW);
    expect(result.snapshotAt).toBe(snapshotAt.toISOString());
    expect(
      callArg<{
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }>(prisma.story.findMany).where.publishedAt,
    ).toEqual({
      lte: snapshotAt,
    });
  });

  it('an expired cursor is refused before querying', async () => {
    const cursor = encodeFeedCursor({
      snapshotAt: new Date('2026-10-20T10:00:00.000Z'),
      tier: 0,
      latest: NOW,
      authorId: A,
    });
    await expect(service.feed(VIEWER, { cursor }, NOW)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('an author whose stories went away between queries is left out', async () => {
    prisma.story.findMany.mockResolvedValue([story(id(200), B)]);
    const result = await service.feed(VIEWER, {}, NOW);
    expect(result.authors.map((a) => a.author.identityId)).toEqual([B]);
  });

  it("shows a company's specialty, «مكتب عقاري» for an office, none when hidden", async () => {
    prisma.identity.findMany.mockResolvedValue([
      author(A, 'دار العقار'),
      {
        id: B,
        type: 'OFFICE',
        companyData: null,
        officeData: { name: 'مكتب', logoUrl: null, isVerified: true },
      },
    ]);
    const result = await service.feed(VIEWER, {}, NOW);
    expect(result.authors.map((a) => a.author.subtitle)).toEqual([
      'مكتب هندسي',
      'مكتب عقاري',
    ]);

    const hidden = author(A, 'دار العقار');
    hidden.companyData.servicesHidden = true;
    prisma.identity.findMany.mockResolvedValue([hidden]);
    const again = await service.feed(VIEWER, {}, NOW);
    expect(again.authors[0]?.author.subtitle).toBeNull();
  });

  it('a segment ranks only its kind and its next cursor stays in it', async () => {
    prisma.$queryRaw.mockResolvedValue([
      {
        authorId: A,
        latestIso: '2026-10-20T10:00:00.000Z',
        hasUnseen: true,
        followed: false,
        tier: 1,
      },
      {
        authorId: B,
        latestIso: '2026-10-20T09:00:00.000Z',
        hasUnseen: true,
        followed: false,
        tier: 1,
      },
    ]);
    const result = await service.feed(
      VIEWER,
      { type: 'OFFICE', limit: 1 },
      NOW,
    );
    const sql = callArg<{ text: string; values: unknown[] }>(prisma.$queryRaw);
    expect(sql.text).toContain('AND i.type::text =');
    expect(sql.values).toContain('OFFICE');
    expect(decodeFeedCursor(result.nextCursor ?? '', NOW, 'OFFICE').type).toBe(
      'OFFICE',
    );
    // That cursor can't continue «الكل»
    await expect(
      service.feed(VIEWER, { cursor: result.nextCursor ?? '' }, NOW),
    ).rejects.toThrow(BadRequestException);
  });

  it('an empty feed makes only the ranking query', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    await expect(service.feed(VIEWER, {}, NOW)).resolves.toEqual({
      snapshotAt: NOW.toISOString(),
      authors: [],
      nextCursor: null,
    });
    expect(prisma.story.findMany).not.toHaveBeenCalled();
  });

  describe('rankQuery', () => {
    it('passes every value as a parameter, never in the SQL text', () => {
      const q = rankQuery(
        VIEWER,
        NOW,
        NOW,
        { snapshotAt: NOW, tier: 1, latest: NOW, authorId: A },
        21,
      );
      expect(q.text).not.toContain(VIEWER.userId);
      expect(q.text).not.toContain(A);
      expect(q.values).toEqual(
        expect.arrayContaining([VIEWER.userId, VIEWER.identityId, A, 1, 21]),
      );
      expect(q.text).toContain(
        'ORDER BY r.tier ASC, r.latest DESC, r."authorId" ASC',
      );
    });

    it('follows count only if made by the snapshot', () => {
      const snapshot = new Date('2026-10-20T11:30:00.000Z');
      const q = rankQuery(VIEWER, snapshot, NOW, null, 21);
      expect(q.text).toContain('f."createdAt" <=');
      expect(q.values).toContain(snapshot.toISOString());
    });

    it('leaves out authors whose account blocked the viewer, or that it blocked', () => {
      const q = rankQuery(VIEWER, NOW, NOW, null, 21);
      expect(q.text).toContain('NOT EXISTS');
      expect(q.text).toContain('"UserBlock" ub');
      expect(q.text).toMatch(
        /ub\."blockerUserId" = \$\d+ AND ub\."blockedUserId" = i\."userId"/,
      );
      expect(q.text).toMatch(
        /ub\."blockerUserId" = i\."userId" AND ub\."blockedUserId" = \$\d+/,
      );
    });

    it('the first page has no cursor condition', () => {
      const q = rankQuery(VIEWER, NOW, NOW, null, 21);
      expect(q.text).not.toContain('r.tier >');
    });

    it('«الكل» has no type condition', () => {
      const q = rankQuery(VIEWER, NOW, NOW, null, 21);
      expect(q.text).not.toContain('i.type::text');
    });
  });
});
