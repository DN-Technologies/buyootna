import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { assertCleanContent } from '../../core/content-filter/content-filter';
import { blockedUserIdsFor } from '../blocks/block.rules';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewSortOption } from './dto/get-reviews.dto';
import { Prisma, ReactionType } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update a review for a user/identity.
   */
  async createOrUpdateReview(
    reviewerId: string,
    targetUserId: string,
    dto: CreateReviewDto,
  ) {
    if (reviewerId === targetUserId) {
      throw new BadRequestException('لا يمكنك تقييم حسابك الشخصي');
    }

    // Stars-only reviews store an empty comment (the column is required)
    const comment = dto.comment?.trim() ?? '';
    assertCleanContent(comment);

    const reviewerIdentity = await this.prisma.identity.findFirst({
      where: {
        OR: [{ id: reviewerId }, { userId: reviewerId, isActive: true }],
      },
    });

    const targetIdentity = await this.prisma.identity.findFirst({
      where: {
        OR: [{ id: targetUserId }, { userId: targetUserId, isActive: true }],
      },
    });

    const revIdentityId = reviewerIdentity?.id;
    const targIdentityId = targetIdentity?.id;

    const existingReview = await this.prisma.review.findFirst({
      where: {
        OR: [
          ...(revIdentityId && targIdentityId
            ? [
                {
                  reviewerIdentityId: revIdentityId,
                  targetIdentityId: targIdentityId,
                },
              ]
            : []),
          { reviewerId, targetUserId },
        ],
      },
    });

    let review;
    if (existingReview) {
      review = await this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: dto.rating,
          comment,
        },
      });
    } else {
      review = await this.prisma.review.create({
        data: {
          reviewerIdentityId: revIdentityId,
          targetIdentityId: targIdentityId,
          reviewerId,
          targetUserId,
          rating: dto.rating,
          comment,
        },
      });
    }

    return {
      message: 'تم إضافة التقييم بنجاح',
      data: review,
    };
  }

  /**
   * Fetch paginated & sorted reviews for a target user/identity.
   */
  async getReviews(
    targetUserId: string,
    currentIdentityId?: string,
    query?: GetReviewsDto,
    // The signed-in account: reviews by accounts blocked either way are hidden
    currentUserId?: string,
  ) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 20;
    const skip = (page - 1) * limit;

    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    if (query?.sort === ReviewSortOption.OLDEST) {
      orderBy = { createdAt: 'asc' };
    } else if (query?.sort === ReviewSortOption.RATING_DESC) {
      orderBy = { rating: 'desc' };
    } else if (query?.sort === ReviewSortOption.RATING_ASC) {
      orderBy = { rating: 'asc' };
    }

    const blocked = currentUserId
      ? await blockedUserIdsFor(this.prisma, currentUserId)
      : [];
    const whereClause: Prisma.ReviewWhereInput = {
      OR: [{ targetUserId }, { targetIdentityId: targetUserId }],
      ...(blocked.length
        ? {
            // Null-safe: legacy reviews may lack one of the two links
            AND: [
              {
                OR: [{ reviewerId: null }, { reviewerId: { notIn: blocked } }],
              },
              {
                OR: [
                  { reviewerIdentityId: null },
                  { reviewerIdentity: { userId: { notIn: blocked } } },
                ],
              },
            ],
          }
        : {}),
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: whereClause,
        include: {
          reviewerIdentity: {
            include: {
              individualData: true,
              companyData: true,
              officeData: true,
              user: true,
            },
          },
          reactions: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: whereClause }),
    ]);

    const formattedReviews = reviews.map((r) => {
      const ident = r.reviewerIdentity;
      const name =
        ident?.companyData?.name ||
        ident?.officeData?.name ||
        ident?.individualData?.name ||
        ident?.user?.name ||
        'مستخدم بيوتنا';

      const avatarUrl =
        ident?.companyData?.logoUrl ||
        ident?.officeData?.logoUrl ||
        ident?.individualData?.avatarUrl ||
        ident?.user?.avatarUrl ||
        // No picture: the app shows its own logo. Never a stock photo -- it
        // made reviews look like they came from a stranger (QA)
        null;

      const likesCount = r.reactions.filter(
        (rx) => rx.type === ReactionType.LIKE,
      ).length;
      const dislikesCount = r.reactions.filter(
        (rx) => rx.type === ReactionType.DISLIKE,
      ).length;

      const userReaction = currentIdentityId
        ? r.reactions.find((rx) => rx.identityId === currentIdentityId)
        : null;

      return {
        id: r.id,
        userName: name,
        avatarUrl,
        timeAgo: this.formatTimeAgo(r.createdAt),
        createdAt: r.createdAt,
        rating: r.rating,
        comment: r.comment,
        likes: likesCount,
        dislikes: dislikesCount,
        userLiked: userReaction?.type === ReactionType.LIKE,
        userDisliked: userReaction?.type === ReactionType.DISLIKE,
      };
    });

    return {
      data: formattedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get review summary stats (average, total, rating breakdown).
   */
  async getSummary(targetUserId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        OR: [{ targetUserId }, { targetIdentityId: targetUserId }],
      },
      select: { rating: true },
    });

    const totalRatingsCount = reviews.length;
    if (totalRatingsCount === 0) {
      return {
        averageRating: 0,
        totalRatingsCount: 0,
        ratingBreakdown: [
          { star: 5, pct: '0%' },
          { star: 4, pct: '0%' },
          { star: 3, pct: '0%' },
          { star: 2, pct: '0%' },
          { star: 1, pct: '0%' },
        ],
      };
    }

    const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalSum / totalRatingsCount).toFixed(1));

    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (starCounts[r.rating] !== undefined) {
        starCounts[r.rating] += 1;
      }
    });

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: `${Math.round((starCounts[star] / totalRatingsCount) * 100)}%`,
    }));

    return {
      averageRating,
      totalRatingsCount,
      ratingBreakdown,
    };
  }

  /**
   * Toggle Like or Dislike on a review.
   */
  async toggleReaction(
    reviewId: string,
    userId: string,
    identityId: string,
    type: ReactionType,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('التقييم غير موجود');
    }

    // Reactions belong to the persona reacting
    const existingReaction = await this.prisma.reviewReaction.findFirst({
      where: { reviewId, identityId },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await this.prisma.reviewReaction.delete({
          where: { id: existingReaction.id },
        });
        return { message: 'تم إلغاء التفاعل' };
      } else {
        await this.prisma.reviewReaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
        return { message: 'تم تحديث التفاعل' };
      }
    } else {
      await this.prisma.reviewReaction.create({
        data: {
          reviewId,
          identityId,
          userId,
          type,
        },
      });
      return { message: 'تم إضافة التفاعل' };
    }
  }

  /**
   * Delete a review.
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('التقييم غير موجود');
    }

    if (review.reviewerId !== userId && review.reviewerIdentityId !== userId) {
      throw new BadRequestException('لا يمكنك حذف تقييم مستخدم آخر');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'تم حذف التقييم بنجاح' };
  }

  // Admin moderation: same as deleteReview but without the ownership check.
  async adminDeleteReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('التقييم غير موجود');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'تم حذف التقييم بنجاح' };
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return 'الآن';
    }
    if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    }
    if (diffDays < 7) {
      return `منذ ${diffDays} يوم`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `منذ ${weeks} أسبوع`;
    }
    const months = Math.floor(diffDays / 30);
    return `منذ ${months} شهر`;
  }
}
