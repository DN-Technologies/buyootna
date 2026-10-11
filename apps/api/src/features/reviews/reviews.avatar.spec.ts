import { PrismaService } from '../../core/prisma/prisma.service';
import { ReviewsService } from './reviews.service';

// QA: a reviewer without a picture used to get the same stock portrait of a
// stranger, so the review looked like someone else wrote it
describe('review avatars', () => {
  const review = (reviewerIdentity: object) => ({
    id: 'r1',
    rating: 5,
    comment: 'ممتاز',
    createdAt: new Date(),
    reactions: [],
    reviewerIdentity,
  });

  const avatarFor = async (reviewerIdentity: object) => {
    const prisma = {
      review: {
        findMany: jest.fn().mockResolvedValue([review(reviewerIdentity)]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const service = new ReviewsService(prisma as unknown as PrismaService);
    const result: any = await service.getReviews('target');
    return (result.data ?? result.reviews)[0].avatarUrl;
  };

  const noData = {
    individualData: null,
    companyData: null,
    officeData: null,
    user: { name: 'علي', avatarUrl: null },
  };

  it('is null when the reviewer has no picture (the app shows its logo)', async () => {
    expect(await avatarFor(noData)).toBeNull();
    expect(
      await avatarFor({
        ...noData,
        individualData: { name: 'علي', avatarUrl: null },
      }),
    ).toBeNull();
  });

  it("is the reviewer's own picture when they have one", async () => {
    expect(
      await avatarFor({
        ...noData,
        individualData: { name: 'علي', avatarUrl: 'https://cdn/ali.jpg' },
      }),
    ).toBe('https://cdn/ali.jpg');
    expect(
      await avatarFor({
        ...noData,
        companyData: { name: 'أركان', logoUrl: 'https://cdn/arkan.png' },
      }),
    ).toBe('https://cdn/arkan.png');
  });
});
