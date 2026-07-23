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
import { ReactionType, type User } from '@prisma/client';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('users/:targetUserId/reviews')
  async createOrUpdateReview(
    @CurrentUser() user: User,
    @Param('targetUserId') targetUserId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createOrUpdateReview(user.id, targetUserId, dto);
  }

  @Get('users/:targetUserId/reviews')
  async getReviews(
    @Param('targetUserId') targetUserId: string,
    @Query() query: GetReviewsDto,
    @CurrentUser() user?: User,
  ) {
    return this.reviewsService.getReviews(targetUserId, user?.id, query);
  }

  @Get('users/:targetUserId/reviews/summary')
  async getSummary(@Param('targetUserId') targetUserId: string) {
    return this.reviewsService.getSummary(targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/like')
  async toggleLike(
    @CurrentUser() user: User,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.toggleReaction(
      reviewId,
      user.id,
      ReactionType.LIKE,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/dislike')
  async toggleDislike(
    @CurrentUser() user: User,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.toggleReaction(
      reviewId,
      user.id,
      ReactionType.DISLIKE,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('reviews/:reviewId')
  async deleteReview(
    @CurrentUser() user: User,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, user.id);
  }
}
