import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminRatingsService } from './admin-ratings.service';
import { ReviewsService } from '../../../reviews/reviews.service';

describe('AdminRatingsService', () => {
  let service: AdminRatingsService;
  let prisma: { identity: { findFirst: jest.Mock } };
  let reviewsService: {
    getReviews: jest.Mock;
    getSummary: jest.Mock;
    adminDeleteReview: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      identity: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'identity-1', type: 'COMPANY' }),
      },
    };
    reviewsService = {
      getReviews: jest.fn().mockResolvedValue({ data: [] }),
      getSummary: jest.fn().mockResolvedValue({ averageRating: 0 }),
      adminDeleteReview: jest.fn().mockResolvedValue({ message: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRatingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ReviewsService, useValue: reviewsService },
      ],
    }).compile();

    service = module.get<AdminRatingsService>(AdminRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getReviewsForUser delegates with no currentUserId (admin view is not "mine")', async () => {
    const query = { page: '1' };
    await service.getReviewsForUser('user-1', query);
    expect(reviewsService.getReviews).toHaveBeenCalledWith(
      'user-1',
      undefined,
      query,
    );
  });

  it('getSummaryForUser delegates to ReviewsService.getSummary', async () => {
    await service.getSummaryForUser('user-1');
    expect(reviewsService.getSummary).toHaveBeenCalledWith('user-1');
  });

  it("scopes to the named identity once it's checked as the user's", async () => {
    await service.getReviewsForUser('user-1', {}, 'identity-1');
    await service.getSummaryForUser('user-1', 'identity-1');

    expect(prisma.identity.findFirst).toHaveBeenCalledWith({
      where: { id: 'identity-1', userId: 'user-1' },
      select: { id: true, type: true },
    });
    expect(reviewsService.getReviews).toHaveBeenCalledWith(
      'identity-1',
      undefined,
      {},
    );
    expect(reviewsService.getSummary).toHaveBeenCalledWith('identity-1');
  });

  it("refuses another account's identity", async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    await expect(
      service.getSummaryForUser('user-1', 'someone-elses'),
    ).rejects.toThrow(NotFoundException);
    expect(reviewsService.getSummary).not.toHaveBeenCalled();
  });

  it('deleteReview delegates to ReviewsService.adminDeleteReview', async () => {
    await service.deleteReview('review-1');
    expect(reviewsService.adminDeleteReview).toHaveBeenCalledWith('review-1');
  });
});
