import { ReviewsService } from './reviews.service';
import type { PrismaService } from '../../core/prisma/prisma.service';

describe('reviews and blocks', () => {
  const setup = (
    blockRows: { blockerUserId: string; blockedUserId: string }[],
  ) => {
    const prisma = {
      review: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      userBlock: { findMany: jest.fn().mockResolvedValue(blockRows) },
    };
    return {
      prisma,
      service: new ReviewsService(prisma as unknown as PrismaService),
    };
  };
  const whereOf = (m: jest.Mock) =>
    (m.mock.calls[0] as [{ where: Record<string, unknown> }])[0].where;

  it('signed out: every review of the target, no block lookup', async () => {
    const { prisma, service } = setup([]);
    await service.getReviews('target');
    expect(prisma.userBlock.findMany).not.toHaveBeenCalled();
    expect(whereOf(prisma.review.findMany)).toEqual({
      OR: [{ targetUserId: 'target' }, { targetIdentityId: 'target' }],
    });
  });

  it('signed in: reviews by accounts blocked either way are left out, in the list and the total', async () => {
    const { prisma, service } = setup([
      { blockerUserId: 'me', blockedUserId: 'troll' },
      { blockerUserId: 'other', blockedUserId: 'me' },
    ]);
    await service.getReviews('target', 'my-ident', undefined, 'me');
    const hidden = {
      AND: [
        {
          OR: [
            { reviewerId: null },
            { reviewerId: { notIn: ['troll', 'other'] } },
          ],
        },
        {
          OR: [
            { reviewerIdentityId: null },
            { reviewerIdentity: { userId: { notIn: ['troll', 'other'] } } },
          ],
        },
      ],
    };
    expect(whereOf(prisma.review.findMany)).toMatchObject(hidden);
    expect(whereOf(prisma.review.count)).toMatchObject(hidden);
  });

  it('signed in with no blocks: the plain query', async () => {
    const { prisma, service } = setup([]);
    await service.getReviews('target', 'my-ident', undefined, 'me');
    expect(whereOf(prisma.review.findMany)).not.toHaveProperty('AND');
  });
});
