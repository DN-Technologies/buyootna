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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { ReviewsService } from './reviews.service';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  CreateReviewResponseDto,
  ReviewListResponseDto,
  ReviewMessageResponseDto,
  ReviewSummaryResponseDto,
} from './dto/review-response.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('users/:targetUserId/reviews')
  @ApiAuth()
  @ApiOperation({ summary: 'Create or update the current user\'s review of a target user' })
  @ApiParam({ name: 'targetUserId', description: 'Target user ID' })
  @ApiResponse({ status: 201, type: CreateReviewResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({ summary: 'List reviews for a target user, paginated' })
  @ApiParam({ name: 'targetUserId', description: 'Target user ID' })
  @ApiResponse({ status: 200, type: ReviewListResponseDto })
  @ApiCommonErrors()
  async getReviews(
    @Param('targetUserId') targetUserId: string,
    @Query() query: GetReviewsDto,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.reviewsService.getReviews(targetUserId, reqUser?.userId, query);
  }

  @Get('users/:targetUserId/reviews/summary')
  @ApiOperation({ summary: 'Get review summary stats (average rating, count, breakdown) for a target user' })
  @ApiParam({ name: 'targetUserId', description: 'Target user ID' })
  @ApiResponse({ status: 200, type: ReviewSummaryResponseDto })
  @ApiCommonErrors()
  async getSummary(@Param('targetUserId') targetUserId: string) {
    return this.reviewsService.getSummary(targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/like')
  @ApiAuth()
  @ApiOperation({ summary: 'Toggle a like reaction on a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 201, type: ReviewMessageResponseDto })
  @ApiCommonErrors()
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
  @ApiAuth()
  @ApiOperation({ summary: 'Toggle a dislike reaction on a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 201, type: ReviewMessageResponseDto })
  @ApiCommonErrors()
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
  @ApiAuth()
  @ApiOperation({ summary: "Delete the current user's own review" })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 200, type: ReviewMessageResponseDto })
  @ApiCommonErrors()
  async deleteReview(
    @CurrentUser() reqUser: RequestUser,
    @Param('reviewId') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(reviewId, reqUser.userId);
  }
}
