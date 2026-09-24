import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { userService } from '@/shared/api/user.service';
import {
  DEFAULT_REVIEW_SUMMARY,
  ReviewItem,
  ReviewSummary,
} from '@/shared/components/profile/types';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

interface UseUserProfileOptions {
  id: string;
  sort?: string;
}

export function useUserProfile({ id, sort = 'all' }: UseUserProfileOptions) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const identities = useAuthStore((state) => state.identities);

  // `id` is the owning Identity ID (see property host.id), so compare against
  // current user id or any active user identity.
  const isOwnProfile =
    Boolean(id) &&
    (currentUser?.id === id ||
      identities.some((identity) => identity.id === id));

  // 1. Fetch user profile
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    isError: profileError,
  } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => userService.getUserProfile(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (profileError) {
      showAlert('خطأ', 'فشل تحميل بيانات المستخدم');
    }
  }, [profileError]);

  // 2. Fetch user properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['userProperties', id],
    queryFn: () => userService.getUserProperties(id),
    enabled: Boolean(id),
  });

  // 3. Fetch reviews & summary
  const reviewsQueryKey = ['userReviews', id, sort];
  const { data: reviewsResult, refetch: refetchReviews } = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: () => userService.getUserReviewsWithSummary(id, sort),
    enabled: Boolean(id),
  });

  const reviews = reviewsResult?.reviews ?? [];
  const reviewSummary: ReviewSummary =
    reviewsResult?.summary ?? DEFAULT_REVIEW_SUMMARY;

  // 4. Submit new review
  const handleReviewSubmit = async (commentText: string, rating: number) => {
    try {
      await userService.addUserReview(id, rating, commentText);
      showAlert('نجاح', 'تمت إضافة تقييمك بنجاح');
      refetchReviews();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'فشل إضافة التقييم';
      showAlert(
        'خطأ',
        typeof msg === 'string' ? msg : msg[0] || 'فشل إضافة التقييم',
      );
    }
  };

  // 5. Toggle Like reaction with optimistic query cache update
  const handleToggleLike = async (reviewId: string) => {
    queryClient.setQueryData(
      reviewsQueryKey,
      (prev: { reviews: ReviewItem[]; summary: ReviewSummary } | undefined) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r: ReviewItem) => {
                if (r.id !== reviewId) return r;
                const wasLiked = r.userLiked;
                return {
                  ...r,
                  userLiked: !wasLiked,
                  likes: wasLiked ? r.likes - 1 : r.likes + 1,
                  ...(wasLiked
                    ? {}
                    : {
                        userDisliked: false,
                        dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes,
                      }),
                };
              }),
            }
          : prev,
    );

    try {
      await userService.toggleReviewLike(reviewId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // 6. Toggle Dislike reaction with optimistic query cache update
  const handleToggleDislike = async (reviewId: string) => {
    queryClient.setQueryData(
      reviewsQueryKey,
      (prev: { reviews: ReviewItem[]; summary: ReviewSummary } | undefined) =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map((r: ReviewItem) => {
                if (r.id !== reviewId) return r;
                const wasDisliked = r.userDisliked;
                return {
                  ...r,
                  userDisliked: !wasDisliked,
                  dislikes: wasDisliked ? r.dislikes - 1 : r.dislikes + 1,
                  ...(wasDisliked
                    ? {}
                    : {
                        userLiked: false,
                        likes: r.userLiked ? r.likes - 1 : r.likes,
                      }),
                };
              }),
            }
          : prev,
    );

    try {
      await userService.toggleReviewDislike(reviewId);
    } catch (error) {
      console.error('Failed to toggle dislike:', error);
    }
  };

  return {
    userProfile,
    isLoadingProfile,
    profileError,
    properties,
    isLoadingProperties,
    reviews,
    reviewSummary,
    isOwnProfile,
    handleReviewSubmit,
    handleToggleLike,
    handleToggleDislike,
    refetchReviews,
  };
}
