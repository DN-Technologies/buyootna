import { BadRequestException, NotFoundException } from '@nestjs/common';

import type { StoriesService } from '../stories.service';
import {
  AUTHOR,
  NOW,
  pending,
  setupStoriesService,
  STORY,
  storyRow,
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

describe('StoriesService: recording views and the viewer list', () => {
  const harness = setupStoriesService();
  const { prisma, media, storage } = harness;
  let service: StoriesService;
  beforeEach(() => {
    service = harness.service;
  });

  describe('recordViews', () => {
    const viewer = { identityId: 'viewer-ident', userId: 'viewer-user' };
    const ids = [STORY, '55555555-5555-4555-8555-555555555555'];

    it('records only live stories of visible authors from other accounts', async () => {
      prisma.story.findMany.mockResolvedValue([{ id: STORY }]);
      await service.recordViews(viewer, { storyIds: ids }, NOW);

      expect(
        callArg<{ where: Record<string, unknown> }>(prisma.story.findMany)
          .where,
      ).toEqual({
        id: { in: ids },
        status: 'ACTIVE',
        expiresAt: { gt: NOW },
        identity: {
          user: {
            isDisabled: false,
            isBlocked: false,
            // No block either way between the two accounts
            blocksMade: { none: { blockedUserId: 'viewer-user' } },
            blocksReceived: { none: { blockerUserId: 'viewer-user' } },
          },
          OR: [
            { type: 'COMPANY', companyData: { status: 'APPROVED' } },
            { type: 'OFFICE', officeData: { status: 'APPROVED' } },
          ],
          // Never the viewer's own account (any of its profiles)
          userId: { not: 'viewer-user' },
        },
      });
      expect(prisma.storyView.createMany).toHaveBeenCalledWith({
        data: [{ storyId: STORY, viewerIdentityId: 'viewer-ident' }],
        // One view per profile and story; repeating changes nothing
        skipDuplicates: true,
      });
    });

    it('nothing eligible: nothing written', async () => {
      prisma.story.findMany.mockResolvedValue([]);
      await service.recordViews(viewer, { storyIds: ids }, NOW);
      expect(prisma.storyView.createMany).not.toHaveBeenCalled();
    });
  });

  describe('viewers', () => {
    const viewerRow = (n: number, at: string) => ({
      viewedAt: new Date(at),
      viewer: {
        id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
        type: 'INDIVIDUAL',
        individualData: { name: `مشاهد ${n}`, avatarUrl: null },
        companyData: null,
        officeData: null,
      },
    });

    beforeEach(() => {
      prisma.story.findUnique.mockResolvedValue({
        identityId: AUTHOR,
        status: 'ACTIVE',
      });
    });

    it('the author gets the newest first, the total, and a cursor', async () => {
      prisma.storyView.findMany.mockResolvedValue([
        viewerRow(1, '2026-10-20T11:00:00.000Z'),
        viewerRow(2, '2026-10-20T10:00:00.000Z'),
        viewerRow(3, '2026-10-20T09:00:00.000Z'),
      ]);
      prisma.storyView.count.mockResolvedValue(3);

      const result = await service.viewers(STORY, AUTHOR, { limit: 2 });
      expect(result.total).toBe(3);
      expect(result.viewers.map((v) => v.name)).toEqual(['مشاهد 1', 'مشاهد 2']);
      expect(result.viewers[0]).toMatchObject({
        type: 'INDIVIDUAL',
        avatarUrl: null,
        isVerified: false,
        viewedAt: '2026-10-20T11:00:00.000Z',
      });
      expect(result.nextCursor).not.toBeNull();

      const query = callArg<{
        where: Record<string, unknown>;
        orderBy: unknown;
        take: number;
      }>(prisma.storyView.findMany);
      expect(query.where).toEqual({
        storyId: STORY,
        viewer: { user: { isDisabled: false, isBlocked: false } },
      });
      expect(query.orderBy).toEqual([
        { viewedAt: 'desc' },
        { viewerIdentityId: 'asc' },
      ]);
      expect(query.take).toBe(3);
      // The total leaves out the same viewers as the list
      expect(
        callArg<{ where: Record<string, unknown> }>(prisma.storyView.count)
          .where,
      ).toEqual({
        storyId: STORY,
        viewer: { user: { isDisabled: false, isBlocked: false } },
      });
    });

    it('the next page continues after the cursor', async () => {
      prisma.storyView.findMany.mockResolvedValue([
        viewerRow(1, '2026-10-20T11:00:00.000Z'),
        viewerRow(2, '2026-10-20T10:00:00.000Z'),
      ]);
      prisma.storyView.count.mockResolvedValue(2);
      const first = await service.viewers(STORY, AUTHOR, { limit: 1 });

      prisma.storyView.findMany.mockResolvedValue([
        viewerRow(2, '2026-10-20T10:00:00.000Z'),
      ]);
      await service.viewers(STORY, AUTHOR, {
        limit: 1,
        cursor: first.nextCursor ?? undefined,
      });
      expect(
        callArg<{ where: { OR: unknown } }>(prisma.storyView.findMany, 1).where
          .OR,
      ).toEqual([
        { viewedAt: { lt: new Date('2026-10-20T11:00:00.000Z') } },
        {
          viewedAt: new Date('2026-10-20T11:00:00.000Z'),
          viewerIdentityId: { gt: '00000000-0000-4000-8000-000000000001' },
        },
      ]);
    });

    it.each([
      ['someone else', { identityId: 'other', status: 'ACTIVE' }],
      ['a deleted story', { identityId: AUTHOR, status: 'DELETED' }],
      ['a pending story', { identityId: AUTHOR, status: 'PENDING' }],
      ['no story', null],
    ])('%s gets 404', async (_label, row) => {
      prisma.story.findUnique.mockResolvedValue(row);
      await expect(service.viewers(STORY, AUTHOR, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.storyView.findMany).not.toHaveBeenCalled();
    });

    it('a malformed cursor is a 400', async () => {
      await expect(
        service.viewers(STORY, AUTHOR, { cursor: 'not-a-cursor' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('view counts leave out disabled or blocked viewers, like the list', async () => {
    prisma.story.findMany.mockResolvedValue([storyRow()]);
    prisma.storyView.groupBy.mockResolvedValue([]);
    await service.findMine(AUTHOR, NOW);
    expect(
      callArg<{ where: Record<string, unknown> }>(prisma.storyView.groupBy)
        .where,
    ).toEqual({
      storyId: { in: [STORY] },
      viewer: { user: { isDisabled: false, isBlocked: false } },
    });
  });
});
