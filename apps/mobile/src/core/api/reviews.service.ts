import apiClient from '@/core/api/api';
import { ReviewItem } from '@/core/components/profile/types';

export interface ReviewsSummaryResponse {
  averageRating: number;
  totalRatingsCount: number;
  ratingBreakdown: Array<{ star: number; pct: string }>;
}

export interface PaginatedReviewsResponse {
  data: ReviewItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewsService = {
  /**
   * Fetches paginated & sorted reviews for a target user/company.
   */
  getReviews: async (
    targetUserId: string,
    sort: string = 'all',
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedReviewsResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (sort && sort !== 'all') {
      params.append('sort', sort);
    }
    const response = await apiClient.get<PaginatedReviewsResponse>(
      `/users/${targetUserId}/reviews?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Fetches rating summary stats for a target user/company.
   */
  getSummary: async (
    targetUserId: string,
  ): Promise<ReviewsSummaryResponse> => {
    const response = await apiClient.get<ReviewsSummaryResponse>(
      `/users/${targetUserId}/reviews/summary`,
    );
    return response.data;
  },

  /**
   * Submits a rating & review comment for a target user/company.
   */
  addReview: async (
    targetUserId: string,
    rating: number,
    comment: string,
  ): Promise<void> => {
    await apiClient.post(`/users/${targetUserId}/reviews`, {
      rating,
      comment,
    });
  },

  /**
   * Toggles Like reaction on a review.
   */
  toggleLike: async (reviewId: string): Promise<void> => {
    await apiClient.post(`/reviews/${reviewId}/like`);
  },

  /**
   * Toggles Dislike reaction on a review.
   */
  toggleDislike: async (reviewId: string): Promise<void> => {
    await apiClient.post(`/reviews/${reviewId}/dislike`);
  },
};
