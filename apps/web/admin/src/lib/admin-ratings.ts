import { api } from './api'

export interface AdminReviewRow {
  id: string
  userName: string
  avatarUrl: string
  timeAgo: string
  createdAt: string
  rating: number
  comment: string
  likes: number
  dislikes: number
  userLiked: boolean
  userDisliked: boolean
}

export interface AdminReviewsResponse {
  data: AdminReviewRow[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AdminReviewsSummary {
  averageRating: number
  totalRatingsCount: number
  ratingBreakdown: { star: number; pct: string }[]
}

export async function fetchUserReviews(
  userId: string,
  identityId?: string,
): Promise<AdminReviewsResponse> {
  const res = await api.get(`/admin/users/${userId}/reviews`, {
    params: { limit: '100', identityId },
  })
  return res.data
}

export async function fetchUserReviewsSummary(
  userId: string,
  identityId?: string,
): Promise<AdminReviewsSummary> {
  const res = await api.get(`/admin/users/${userId}/reviews/summary`, {
    params: { identityId },
  })
  return res.data
}

export async function deleteReview(
  reviewId: string,
): Promise<{ message: string }> {
  const res = await api.delete(`/admin/reviews/${reviewId}`)
  return res.data
}
