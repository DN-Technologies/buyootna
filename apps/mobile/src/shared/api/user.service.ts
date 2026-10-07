import apiClient from '@/shared/api/api';
import { reviewsService } from '@/shared/api/reviews.service';
import {
  DEFAULT_REVIEW_SUMMARY,
  ReviewItem,
  ReviewSummary,
  UserProfile,
} from '@/shared/components/profile/types';
import { PropertyDto } from '@/types/feed';

export const userService = {
  /**
   * Fetches public user profile information and normalizes profile data.
   */
  getUserProfile: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/users/${id}`);
    const user = response.data;

    let name = 'مستخدم بيوتنا';
    let avatarUrl = 'https://via.placeholder.com/150';

    if (user.role === 'COMPANY' && user.companyProfile) {
      name = user.companyProfile.name || name;
      avatarUrl = user.companyProfile.logoUrl || avatarUrl;
    } else if (user.role === 'OFFICE' && user.officeProfile) {
      name = user.officeProfile.name || name;
      avatarUrl = user.officeProfile.logoUrl || avatarUrl;
    } else if (user.name) {
      name = user.name;
      avatarUrl = user.avatarUrl || avatarUrl;
    } else {
      name = user.email ? user.email.split('@')[0] : 'مستخدم';
    }

    const date = new Date(user.createdAt);
    const joinedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;

    // Real trust signals for the persona shown (older APIs omit `stats`)
    const stats = user.stats;

    return {
      id: user.id,
      name,
      avatarUrl,
      rating: stats?.rating ?? 0,
      reviewsCount: stats?.reviewsCount ?? 0,
      soldCount: stats?.soldCount ?? 0,
      presence: stats?.presence ?? null,
      responseTime: stats?.responseTime ?? null,
      phone: user.phone,
      joinedDate,
      role: user.role,
    };
  },

  /**
   * Fetches all properties owned by a user identity.
   */
  getUserProperties: async (id: string): Promise<PropertyDto[]> => {
    const response = await apiClient.get('/properties', {
      params: { identityId: id, limit: 100 },
    });
    return response.data?.data || [];
  },

  /**
   * Fetches reviews and review summary for a given user identity.
   */
  getUserReviewsWithSummary: async (
    id: string,
    sort: string,
  ): Promise<{ reviews: ReviewItem[]; summary: ReviewSummary }> => {
    const [reviews, summary] = await Promise.all([
      apiClient
        .get(`/users/${id}/reviews`, { params: { sort } })
        .then((res) => (res.data?.data ?? []) as ReviewItem[])
        .catch((error) => {
          console.error('Failed to load user reviews:', error);
          return [] as ReviewItem[];
        }),
      apiClient
        .get(`/users/${id}/reviews/summary`)
        .then((res) => (res.data ?? DEFAULT_REVIEW_SUMMARY) as ReviewSummary)
        .catch((error) => {
          console.error('Failed to load review summary:', error);
          return DEFAULT_REVIEW_SUMMARY;
        }),
    ]);
    return { reviews, summary };
  },

  /**
   * Submits a review for a user identity.
   */
  addUserReview: async (
    targetUserId: string,
    rating: number,
    comment: string,
  ): Promise<void> => {
    return reviewsService.addReview(targetUserId, rating, comment);
  },

  /**
   * Toggles like reaction on a review.
   */
  toggleReviewLike: async (reviewId: string): Promise<void> => {
    return reviewsService.toggleLike(reviewId);
  },

  /**
   * Toggles dislike reaction on a review.
   */
  toggleReviewDislike: async (reviewId: string): Promise<void> => {
    return reviewsService.toggleDislike(reviewId);
  },
};
