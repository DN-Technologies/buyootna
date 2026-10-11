import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { reviewsService } from '@/shared/api/reviews.service';
import { ReviewItem, ReviewSummary } from '@/shared/components/profile/types';
import { showAlert } from '@/shared/utils/alert';

export const DEFAULT_OFFICE_REVIEW_SUMMARY: ReviewSummary = {
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

export interface OfficeReviewsData {
  summary: ReviewSummary;
  reviews: ReviewItem[];
}

export function useOfficeReviews(targetUserId?: string, enabled = true) {
  const queryClient = useQueryClient();
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [reviewSort, setReviewSort] = useState('all');

  const reviewsQueryKey = useMemo(
    () => ['officeReviews', targetUserId, reviewSort],
    [targetUserId, reviewSort],
  );

  const { data: reviewsData, refetch: refetchReviews } =
    useQuery<OfficeReviewsData>({
      queryKey: reviewsQueryKey,
      queryFn: async () => {
        if (!targetUserId) {
          return { summary: DEFAULT_OFFICE_REVIEW_SUMMARY, reviews: [] };
        }
        const [sumRes, revRes] = await Promise.all([
          reviewsService.getSummary(targetUserId),
          reviewsService.getReviews(targetUserId, reviewSort),
        ]);
        return {
          summary: sumRes ?? DEFAULT_OFFICE_REVIEW_SUMMARY,
          reviews: revRes?.data ?? [],
        };
      },
      enabled: Boolean(enabled && targetUserId),
    });

  const reviewSummary: ReviewSummary =
    reviewsData?.summary ?? DEFAULT_OFFICE_REVIEW_SUMMARY;
  const reviews: ReviewItem[] = reviewsData?.reviews ?? [];

  const handleAddReview = useCallback(
    async (comment: string, rating: number) => {
      if (!targetUserId) return;
      try {
        await reviewsService.addReview(targetUserId, rating, comment);
        showAlert('تم بنجاح', 'تم إضافة تقييمك بنجاح');
        refetchReviews();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'تعذر إضافة التقييم';
        showAlert('خطأ', msg);
      }
    },
    [refetchReviews, targetUserId],
  );

  const handleToggleLike = useCallback(
    async (revId: string) => {
      queryClient.setQueryData<OfficeReviewsData>(reviewsQueryKey, (prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r: ReviewItem) =>
                r.id === revId
                  ? {
                      ...r,
                      likes: r.userLiked ? r.likes - 1 : r.likes + 1,
                      userLiked: !r.userLiked,
                      dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes,
                      userDisliked: false,
                    }
                  : r,
              ),
            }
          : prev,
      );
      try {
        await reviewsService.toggleLike(revId);
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },
    [queryClient, reviewsQueryKey],
  );

  const handleToggleDislike = useCallback(
    async (revId: string) => {
      queryClient.setQueryData<OfficeReviewsData>(reviewsQueryKey, (prev) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r: ReviewItem) =>
                r.id === revId
                  ? {
                      ...r,
                      dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes + 1,
                      userDisliked: !r.userDisliked,
                      likes: r.userLiked ? r.likes - 1 : r.likes,
                      userLiked: false,
                    }
                  : r,
              ),
            }
          : prev,
      );
      try {
        await reviewsService.toggleDislike(revId);
      } catch (error) {
        console.error('Error toggling dislike:', error);
      }
    },
    [queryClient, reviewsQueryKey],
  );

  const handleShowMoreReviews = useCallback(() => {
    setVisibleReviewsCount((prev) => prev + 3);
  }, []);

  const displayedReviews = reviews.slice(0, visibleReviewsCount);

  return {
    reviewSummary,
    reviews,
    displayedReviews,
    visibleReviewsCount,
    reviewSort,
    setReviewSort,
    handleShowMoreReviews,
    handleAddReview,
    handleToggleLike,
    handleToggleDislike,
    refetchReviews,
  };
}
