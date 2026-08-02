import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReactionType } from '@prisma/client';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('users/:targetUserId/reviews')
  async createOrUpdateReview(
    @CurrentUser() reqUser: RequestUser,
    @Param('targetUserId') targetUserId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createOrUpdateReview(
      reqUser.userId,
      targetUserId,
      dto,
    );
  }

  @Get('users/:targetUserId/reviews')
  async getReviews(
    @Param('targetUserId') targetUserId: string,
    @Query() query: GetReviewsDto,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.reviewsService.getReviews(targetUserId, reqUser?.userId, query);
  }

  @Get('users/:targetUserId/reviews/summary')
  async getSummary(@Param('targetUserId') targetUserId: string) {
    return this.reviewsService.getSummary(targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/like')
  async toggleLike(
    @CurrentUser() reqUser: RequestUser,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.toggleReaction(
      reviewId,
      reqUser.userId,
      ReactionType.LIKE,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/dislike')
  async toggleDislike(
    @CurrentUser() reqUser: RequestUser,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.toggleReaction(
      reviewId,
      reqUser.userId,
      ReactionType.DISLIKE,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('reviews/:reviewId')
  async deleteReview(
    @CurrentUser() reqUser: RequestUser,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, reqUser.userId);
  }
}
