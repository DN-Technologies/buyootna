import { NotFoundException } from '@nestjs/common';

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

// The real lockKeys runs (against the mocked $executeRaw); only the
// approval check is stubbed
jest.mock('../../identities/persona-rules', () => ({
  ...jest.requireActual<Record<string, unknown>>(
    '../../identities/persona-rules',
  ),
  assertApprovedProvider: jest.fn(),
}));
jest.mock('../../company-subscriptions/company-subscription.rules', () => ({
  assertActiveCompanySubscription: jest.fn(),
}));

describe("StoriesService: the author's own stories and one author's", () => {
  const harness = setupStoriesService();
  const { prisma, media, storage } = harness;
  let service: StoriesService;
  beforeEach(() => {
    service = harness.service;
  });

  describe('findMine', () => {
    it('only live stories, with their view counts', async () => {
      prisma.story.findMany.mockResolvedValue([storyRow()]);
      prisma.storyView.groupBy.mockResolvedValue([
        { storyId: STORY, _count: { _all: 3 } },
      ]);
      const result = await service.findMine(AUTHOR, NOW);
      expect(
        callArg<{
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }>(prisma.story.findMany).where,
      ).toEqual({
        identityId: AUTHOR,
        status: 'ACTIVE',
        expiresAt: { gt: NOW },
      });
      expect(result.stories[0]).toMatchObject({ id: STORY, viewCount: 3 });
    });
  });

  describe('findRings', () => {
    const OTHER = '55555555-5555-4555-8555-555555555555';
    const second = '44444444-4444-4444-8444-444444444444';

    it('only live stories of authors this account may see', async () => {
      prisma.story.findMany.mockResolvedValue([]);
      await service.findRings(VIEWER, [AUTHOR], NOW);
      const { where } = callArg<{ where: Record<string, unknown> }>(
        prisma.story.findMany,
      );
      expect(where).toMatchObject({
        identityId: { in: [AUTHOR] },
        status: 'ACTIVE',
        expiresAt: { gt: NOW },
        identity: {
          user: {
            blocksMade: { none: { blockedUserId: VIEWER.userId } },
            blocksReceived: { none: { blockerUserId: VIEWER.userId } },
          },
        },
      });
    });

    it('asks nothing more and draws no ring when none have stories', async () => {
      prisma.story.findMany.mockResolvedValue([]);
      expect(await service.findRings(VIEWER, [AUTHOR], NOW)).toEqual({
        rings: [],
      });
      expect(prisma.storyView.findMany).not.toHaveBeenCalled();
    });

    it('tells unseen, partly watched and seen apart, per author', async () => {
      const third = '66666666-6666-4666-8666-666666666666';
      const fourth = '77777777-7777-4777-8777-777777777777';
      const SEEN_AUTHOR = '88888888-8888-4888-8888-888888888888';
      prisma.story.findMany.mockResolvedValue([
        { id: STORY, identityId: AUTHOR },
        { id: second, identityId: OTHER },
        { id: third, identityId: OTHER },
        { id: fourth, identityId: SEEN_AUTHOR },
      ]);
      prisma.storyView.findMany.mockResolvedValue([
        { storyId: second },
        { storyId: fourth },
      ]);

      const { rings } = await service.findRings(
        VIEWER,
        [AUTHOR, OTHER, SEEN_AUTHOR],
        NOW,
      );

      expect(rings).toEqual([
        { identityId: AUTHOR, hasUnseen: true, partial: false },
        { identityId: OTHER, hasUnseen: true, partial: true },
        { identityId: SEEN_AUTHOR, hasUnseen: false, partial: false },
      ]);
      expect(
        callArg<{ where: Record<string, unknown> }>(prisma.storyView.findMany)
          .where,
      ).toMatchObject({ viewerIdentityId: VIEWER.identityId });
    });
  });

  describe('findByAuthor', () => {
    const author = {
      id: AUTHOR,
      type: 'COMPANY',
      companyData: { name: 'شركة البنيان', logoUrl: null, isVerified: true },
      officeData: null,
    };

    it('marks seen stories and opens at the first unseen one', async () => {
      prisma.identity.findFirst.mockResolvedValue(author);
      const second = '44444444-4444-4444-8444-444444444444';
      prisma.story.findMany.mockResolvedValue([
        storyRow(),
        storyRow({ id: second }),
      ]);
      prisma.storyView.findMany.mockResolvedValue([{ storyId: STORY }]);
      prisma.providerFavorite.findUnique.mockResolvedValue({ id: 'f' });

      const result = await service.findByAuthor(VIEWER, AUTHOR, NOW);
      expect(result).toMatchObject({
        author: { identityId: AUTHOR, type: 'COMPANY', name: 'شركة البنيان' },
        followed: true,
        hasUnseen: true,
        firstUnseenIndex: 1,
      });
      expect(result.stories.map((s) => s.viewed)).toEqual([true, false]);
    });

    it('an author who may not appear is 404', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(service.findByAuthor(VIEWER, AUTHOR, NOW)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        callArg<{
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }>(prisma.identity.findFirst).where,
      ).toMatchObject({
        id: AUTHOR,
        user: { isDisabled: false, isBlocked: false },
      });
    });

    it('an author blocked either way is 404 (the query asks for no block)', async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(service.findByAuthor(VIEWER, AUTHOR, NOW)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        callArg<{ where: Record<string, unknown> }>(prisma.identity.findFirst)
          .where,
      ).toMatchObject({
        user: {
          blocksMade: { none: { blockedUserId: 'viewer-user' } },
          blocksReceived: { none: { blockerUserId: 'viewer-user' } },
        },
      });
    });
  });
});
