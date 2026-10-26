import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReviewsService } from '../../../reviews/reviews.service';
import { GetReviewsDto } from '../../../reviews/dto/get-reviews.dto';
import { findOwnedIdentity } from '../users/admin-persona.util';

@Injectable()
export class AdminRatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  // Reviews match a target by user id or identity id: the identity's only,
  // when one is named
  private async targetOf(userId: string, identityId?: string) {
    if (!identityId) return userId;
    return (await findOwnedIdentity(this.prisma, userId, identityId)).id;
  }

  async getReviewsForUser(
    userId: string,
    query?: GetReviewsDto,
    identityId?: string,
  ) {
    const target = await this.targetOf(userId, identityId);
    return this.reviewsService.getReviews(target, undefined, query);
  }

  async getSummaryForUser(userId: string, identityId?: string) {
    return this.reviewsService.getSummary(
      await this.targetOf(userId, identityId),
    );
  }

  async deleteReview(reviewId: string) {
    return this.reviewsService.adminDeleteReview(reviewId);
  }
}
