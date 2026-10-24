import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ForbiddenException } from '@nestjs/common';
import type { StoriesService } from '../stories.service';
import {
  AUTHOR,
  NOW,
  setupStoriesService,
  STORY,
  storyRow,
  VIEWER,
} from './stories-service.harness';
import { callArg } from './test-utils';

jest.mock('../../identities/persona-rules', () => ({
  ...jest.requireActual<Record<string, unknown>>(
    '../../identities/persona-rules',
  ),
  assertApprovedProvider: jest.fn(),
}));
jest.mock('../../company-subscriptions/company-subscription.rules', () => ({
  assertActiveCompanySubscription: jest.fn(),
}));

const DAY = 24 * 3600 * 1000;
const HIGHLIGHT = '33333333-3333-4333-8333-333333333333';
const STORY_2 = '44444444-4444-4444-8444-444444444444';
const THIRTY_DAYS_AGO = new Date(NOW.getTime() - 30 * DAY);

// A highlight as the reads select it
const highlightRow = (over: Record<string, unknown> = {}) => ({
  id: HIGHLIGHT,
  title: 'مشاريعنا',
  coverStoryId: null,
  items: [
    { story: storyRow({ expiresAt: new Date(NOW.getTime() - 5 * DAY) }) },
    {
      story: storyRow({
        id: STORY_2,
        mediaType: 'VIDEO',
        posterKey: 'poster.jpg',
        expiresAt: new Date(NOW.getTime() - 2 * DAY),
      }),
    },
  ],
  ...over,
});

describe('StoriesService: the archive and highlights (المميزة)', () => {
  const harness = setupStoriesService();
  const { prisma, media } = harness;
  let service: StoriesService;
  beforeEach(() => {
    service = harness.service;
    prisma.storyView.groupBy.mockResolvedValue([]);
    prisma.storyHighlight.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation((arg: unknown) =>
      typeof arg === 'function'
        ? (arg as (tx: typeof prisma) => unknown)(prisma)
        : Promise.all(arg as Promise<unknown>[]),
    );
  });

  describe('archive', () => {
    it('own published stories of the last 30 days, newest first, past ones with 15-minute links', async () => {
      const past = storyRow({ expiresAt: new Date(NOW.getTime() - DAY) });
      prisma.story.findMany.mockResolvedValue([past]);
      prisma.storyView.groupBy.mockResolvedValue([
        { storyId: STORY, _count: { _all: 7 } },
      ]);

      const result = await service.archive(AUTHOR, undefined, NOW);

      const args = callArg<{
        where: Record<string, unknown>;
        orderBy: unknown;
      }>(prisma.story.findMany);
      expect(args.where).toEqual({
        identityId: AUTHOR,
        status: 'ACTIVE',
        expiresAt: { gt: THIRTY_DAYS_AGO },
      });
      expect(args.orderBy).toEqual([{ publishedAt: 'desc' }, { id: 'desc' }]);
      expect(media.linksFor).toHaveBeenCalledWith(past, NOW, {
        afterExpiry: true,
      });
      expect(result).toMatchObject({
        stories: [{ id: STORY, viewCount: 7 }],
        nextCursor: null,
      });
    });

    it('pages with a cursor', async () => {
      const rows = Array.from({ length: 31 }, (_, i) =>
        storyRow({
          id: `story-${i}`,
          publishedAt: new Date(NOW.getTime() - i * 3600 * 1000),
        }),
      );
      prisma.story.findMany.mockResolvedValue(rows);
      const first = await service.archive(AUTHOR, undefined, NOW);
      expect(first.stories).toHaveLength(30);
      expect(first.nextCursor).not.toBeNull();

      prisma.story.findMany.mockResolvedValue([]);
      await service.archive(AUTHOR, first.nextCursor!, NOW);
      const { where } = callArg<{ where: { OR: unknown } }>(
        prisma.story.findMany,
        1,
      );
      expect(where.OR).toEqual([
        { publishedAt: { lt: rows[29].publishedAt } },
        { publishedAt: rows[29].publishedAt, id: { lt: 'story-29' } },
      ]);
    });
  });

  describe('reading highlights', () => {
    it("the author's own, with only published stories, the cover a video's poster", async () => {
      media.linksFor.mockImplementation((row: { posterKey: string | null }) =>
        Promise.resolve({
          mediaUrl: 'https://s3.example/media',
          posterUrl: row.posterKey ? 'https://s3.example/poster' : null,
          urlExpiresAt: NOW,
        }),
      );
      prisma.storyHighlight.findMany.mockResolvedValue([
        highlightRow({ coverStoryId: STORY_2 }),
      ]);

      const { highlights } = await service.myHighlights(AUTHOR, NOW);

      const args = callArg<{ where: unknown; select: { items: unknown } }>(
        prisma.storyHighlight.findMany,
      );
      expect(args.where).toEqual({ identityId: AUTHOR });
      expect(args.select.items).toMatchObject({
        where: { story: { status: 'ACTIVE' } },
        orderBy: { position: 'asc' },
      });
      expect(highlights[0]).toMatchObject({
        id: HIGHLIGHT,
        title: 'مشاريعنا',
        coverStoryId: STORY_2,
        coverUrl: 'https://s3.example/poster',
      });
      expect(highlights[0].stories.map((s) => s.id)).toEqual([STORY, STORY_2]);
    });

    it('on a profile: none from an author hidden from the viewer', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(
        service.authorHighlights(VIEWER.userId, AUTHOR, NOW),
      ).resolves.toEqual({ highlights: [] });
      expect(prisma.storyHighlight.findMany).not.toHaveBeenCalled();
      const { where } = callArg<{ where: { user: unknown } }>(
        prisma.identity.findFirst,
      );
      expect(where.user).toMatchObject({
        blocksMade: { none: { blockedUserId: VIEWER.userId } },
        blocksReceived: { none: { blockerUserId: VIEWER.userId } },
      });
    });

    it('on a profile: empty ones are left out', async () => {
      prisma.identity.findFirst.mockResolvedValue({ id: AUTHOR });
      prisma.storyHighlight.findMany.mockResolvedValue([
        highlightRow(),
        highlightRow({ id: 'empty', items: [] }),
      ]);
      const { highlights } = await service.authorHighlights(
        VIEWER.userId,
        AUTHOR,
        NOW,
      );
      expect(highlights.map((h) => h.id)).toEqual([HIGHLIGHT]);
    });
  });

  describe('createHighlight', () => {
    const dto = { title: 'مشاريعنا', storyIds: [STORY, STORY_2] };

    beforeEach(() => {
      prisma.storyHighlight.count.mockResolvedValue(2);
      prisma.story.count.mockResolvedValue(2);
      prisma.storyHighlight.create.mockResolvedValue(highlightRow());
    });

    it('from own stories in the archive (or already highlighted), at the end of the row', async () => {
      await service.createHighlight(AUTHOR, dto, NOW);

      expect(callArg(prisma.story.count)).toEqual({
        where: {
          id: { in: [STORY, STORY_2] },
          identityId: AUTHOR,
          status: 'ACTIVE',
          OR: [
            { expiresAt: { gt: THIRTY_DAYS_AGO } },
            { highlightItems: { some: { highlight: { identityId: AUTHOR } } } },
          ],
        },
      });
      expect(
        callArg<{ data: unknown }>(prisma.storyHighlight.create).data,
      ).toEqual({
        identityId: AUTHOR,
        title: 'مشاريعنا',
        position: 2,
        items: {
          create: [
            { storyId: STORY, position: 0 },
            { storyId: STORY_2, position: 1 },
          ],
        },
      });
    });

    it("refuses another profile's, a deleted or a too-old story", async () => {
      prisma.story.count.mockResolvedValue(1);
      await expect(service.createHighlight(AUTHOR, dto, NOW)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.storyHighlight.create).not.toHaveBeenCalled();
    });

    it('at most 30 per author', async () => {
      prisma.storyHighlight.count.mockResolvedValue(30);
      await expect(service.createHighlight(AUTHOR, dto, NOW)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('companies and offices only', async () => {
      prisma.identity.findUnique.mockResolvedValue({ type: 'INDIVIDUAL' });
      await expect(service.createHighlight(AUTHOR, dto, NOW)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateHighlight', () => {
    beforeEach(() => {
      prisma.storyHighlight.findFirst.mockResolvedValue({
        id: HIGHLIGHT,
        coverStoryId: STORY_2,
        items: [{ storyId: STORY }, { storyId: STORY_2 }],
      });
      prisma.storyHighlight.update.mockResolvedValue(highlightRow());
      prisma.story.count.mockResolvedValue(1);
    });

    it("404s for someone else's", async () => {
      prisma.storyHighlight.findFirst.mockResolvedValue(null);
      await expect(
        service.updateHighlight(AUTHOR, HIGHLIGHT, { title: 'x' }, NOW),
      ).rejects.toThrow(NotFoundException);
      expect(callArg(prisma.storyHighlight.findFirst)).toMatchObject({
        where: { id: HIGHLIGHT, identityId: AUTHOR },
      });
    });

    it('replaces its stories in order; a cover that left goes back to the first', async () => {
      await service.updateHighlight(
        AUTHOR,
        HIGHLIGHT,
        { storyIds: [STORY] },
        NOW,
      );
      expect(prisma.storyHighlightItem.deleteMany).toHaveBeenCalledWith({
        where: { highlightId: HIGHLIGHT },
      });
      expect(prisma.storyHighlightItem.createMany).toHaveBeenCalledWith({
        data: [{ highlightId: HIGHLIGHT, storyId: STORY, position: 0 }],
      });
      expect(
        callArg<{ data: unknown }>(prisma.storyHighlight.update).data,
      ).toEqual({ coverStoryId: null });
    });

    it('renames, keeping its stories and cover', async () => {
      await service.updateHighlight(AUTHOR, HIGHLIGHT, { title: 'عروض' }, NOW);
      expect(prisma.storyHighlightItem.deleteMany).not.toHaveBeenCalled();
      expect(
        callArg<{ data: unknown }>(prisma.storyHighlight.update).data,
      ).toEqual({ title: 'عروض', coverStoryId: STORY_2 });
    });

    it('a cover must be one of its stories', async () => {
      await expect(
        service.updateHighlight(
          AUTHOR,
          HIGHLIGHT,
          { coverStoryId: '55555555-5555-4555-8555-555555555555' },
          NOW,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeHighlight and reorderHighlights', () => {
    it("deletes its own; someone else's is 404", async () => {
      prisma.storyHighlight.findFirst.mockResolvedValue({
        id: HIGHLIGHT,
        coverStoryId: null,
        items: [],
      });
      await service.removeHighlight(AUTHOR, HIGHLIGHT);
      expect(prisma.storyHighlight.delete).toHaveBeenCalledWith({
        where: { id: HIGHLIGHT },
      });

      prisma.storyHighlight.findFirst.mockResolvedValue(null);
      await expect(service.removeHighlight(AUTHOR, 'other')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('reorders when given exactly its highlights', async () => {
      prisma.storyHighlight.findMany.mockResolvedValue([
        { id: 'a' },
        { id: 'b' },
      ]);
      prisma.storyHighlight.update.mockResolvedValue({});
      await service.reorderHighlights(AUTHOR, ['b', 'a']);
      expect(prisma.storyHighlight.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'b' },
        data: { position: 0 },
      });
      expect(prisma.storyHighlight.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'a' },
        data: { position: 1 },
      });

      await expect(
        service.reorderHighlights(AUTHOR, ['a', 'someone-elses']),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
