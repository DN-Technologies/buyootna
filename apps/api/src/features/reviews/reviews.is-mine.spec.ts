import { PrismaService } from '../../core/prisma/prisma.service';
import { ReviewsService } from './reviews.service';

describe("whether a review is the viewer's own", () => {
  const isMine = async (
    row: { reviewerId?: string | null; reviewerIdentity?: object | null },
    viewer?: string,
  ) => {
    const prisma = {
      review: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'r1',
            rating: 5,
            comment: null,
            createdAt: new Date(),
            reactions: [],
            reviewerId: null,
            reviewerIdentity: null,
            ...row,
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      userBlock: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new ReviewsService(prisma as unknown as PrismaService);
    const result = await service.getReviews(
      'target',
      undefined,
      undefined,
      viewer,
    );
    return result.data[0].isMine;
  };

  it('is true for any profile of the viewer account', async () => {
    expect(await isMine({ reviewerIdentity: { userId: 'me' } }, 'me')).toBe(
      true,
    );
  });

  it('is true for an older review that only knows the account', async () => {
    expect(await isMine({ reviewerId: 'me' }, 'me')).toBe(true);
  });

  it('is false for another account', async () => {
    expect(await isMine({ reviewerIdentity: { userId: 'other' } }, 'me')).toBe(
      false,
    );
  });

  it('is false for a guest, even when the author is unknown', async () => {
    expect(await isMine({}, undefined)).toBe(false);
  });
});
