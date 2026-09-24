import { Injectable } from '@nestjs/common';
import { ReviewsService } from '../../reviews/reviews.service';
import { GetReviewsDto } from '../../reviews/dto/get-reviews.dto';

@Injectable()
export class AdminRatingsService {
  constructor(private readonly reviewsService: ReviewsService) {}

  async getReviewsForUser(userId: string, query?: GetReviewsDto) {
    return this.reviewsService.getReviews(userId, undefined, query);
  }

  async getSummaryForUser(userId: string) {
    return this.reviewsService.getSummary(userId);
  }

  async deleteReview(reviewId: string) {
    return this.reviewsService.adminDeleteReview(reviewId);
  }
}
