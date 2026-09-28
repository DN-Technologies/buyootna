import { Test, TestingModule } from '@nestjs/testing';
import { AdminRatingsService } from './admin-ratings.service';
import { ReviewsService } from '../../../reviews/reviews.service';

describe('AdminRatingsService', () => {
  let service: AdminRatingsService;
  let reviewsService: {
    getReviews: jest.Mock;
    getSummary: jest.Mock;
    adminDeleteReview: jest.Mock;
  };

  beforeEach(async () => {
    reviewsService = {
      getReviews: jest.fn().mockResolvedValue({ data: [] }),
      getSummary: jest.fn().mockResolvedValue({ averageRating: 0 }),
      adminDeleteReview: jest.fn().mockResolvedValue({ message: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRatingsService,
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

  it('deleteReview delegates to ReviewsService.adminDeleteReview', async () => {
    await service.deleteReview('review-1');
    expect(reviewsService.adminDeleteReview).toHaveBeenCalledWith('review-1');
  });
});
