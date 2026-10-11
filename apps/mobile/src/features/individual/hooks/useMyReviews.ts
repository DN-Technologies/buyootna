import { useCallback, useEffect, useState } from 'react';

import apiClient from '@/shared/api/api';
import {
  DEFAULT_REVIEW_SUMMARY,
  type ReviewItem,
  type ReviewSummary,
} from '@/shared/components/profile/types';
import { useAuthStore } from '@/shared/store/useAuthStore';

/** Newest / oldest follow the ids, which are ordered by creation. */
export function sortReviews(
  reviews: ReviewItem[],
  sortOption: string,
): ReviewItem[] {
  return [...reviews].sort((a, b) => {
    if (sortOption === 'rating_desc') return b.rating - a.rating;
    if (sortOption === 'rating_asc') return a.rating - b.rating;
    if (sortOption === 'newest') return b.id.localeCompare(a.id);
    if (sortOption === 'oldest') return a.id.localeCompare(b.id);
    return 0;
  });
}

// Optimistic like / dislike: pressing the active one clears it, pressing the
// other switches (the counts follow)
function withLikeToggled(item: ReviewItem): ReviewItem {
  return {
    ...item,
    userLiked: !item.userLiked,
    userDisliked: false,
    likes: item.userLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
    dislikes: item.userDisliked
      ? Math.max(0, item.dislikes - 1)
      : item.dislikes,
  };
}

function withDislikeToggled(item: ReviewItem): ReviewItem {
  return {
    ...item,
    userDisliked: !item.userDisliked,
    userLiked: false,
    dislikes: item.userDisliked
      ? Math.max(0, item.dislikes - 1)
      : item.dislikes + 1,
    likes: item.userLiked ? Math.max(0, item.likes - 1) : item.likes,
  };
}

/**
 * The reviews other people wrote about the signed-in user: the list, its
 * summary, sorting, pull-to-refresh and the like / dislike reactions.
 */
export function useMyReviews() {
  const user = useAuthStore((state) => state.user);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>(DEFAULT_REVIEW_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState('all');

  const fetchReviews = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        apiClient.get(`/users/${user.id}/reviews`, {
          params: { sort: sortOption },
        }),
        apiClient.get(`/users/${user.id}/reviews/summary`),
      ]);

      if (reviewsRes.data?.data) {
        setReviews(reviewsRes.data.data);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (e) {
      console.log('Error fetching reviews from backend:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, sortOption]);

  useEffect(() => {
    setIsLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, [fetchReviews]);

  const toggleLike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((item) => (item.id === reviewId ? withLikeToggled(item) : item)),
    );
    try {
      await apiClient.post(`/reviews/${reviewId}/like`);
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  };

  const toggleDislike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === reviewId ? withDislikeToggled(item) : item,
      ),
    );
    try {
      await apiClient.post(`/reviews/${reviewId}/dislike`);
    } catch (e) {
      console.error('Failed to toggle dislike:', e);
    }
  };

  return {
    reviews,
    sortedReviews: sortReviews(reviews, sortOption),
    summary,
    isLoading,
    refreshing,
    sortOption,
    setSortOption,
    refresh,
    toggleLike,
    toggleDislike,
  };
}
