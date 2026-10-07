import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

// QA: rating someone should only need the stars; the text is optional
describe('stars-only reviews', () => {
  const errorsFor = async (body: object) =>
    (await validate(plainToInstance(CreateReviewDto, body))).map(
      (e) => e.property,
    );

  it('accepts a rating without a comment', async () => {
    expect(await errorsFor({ rating: 4 })).toEqual([]);
    expect(await errorsFor({ rating: 4, comment: '' })).toEqual([]);
  });

  it('still requires a 1-5 rating', async () => {
    expect(await errorsFor({ comment: 'ممتاز' })).toContain('rating');
    expect(await errorsFor({ rating: 0 })).toContain('rating');
    expect(await errorsFor({ rating: 6 })).toContain('rating');
  });

  it('stores an empty comment for a stars-only review', async () => {
    const prisma = {
      identity: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({ id: 'reviewer' })
          .mockResolvedValueOnce({ id: 'target' }),
      },
      review: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'r1' }),
      },
    };
    const service = new ReviewsService(prisma as unknown as PrismaService);

    await service.createOrUpdateReview('reviewer', 'target', { rating: 4 });

    expect(prisma.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ rating: 4, comment: '' }),
    });
  });
});
