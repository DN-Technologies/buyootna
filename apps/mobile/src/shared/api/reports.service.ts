import apiClient from '@/shared/api/api';

export const reportsService = {
  /**
   * Submits a report against a target user/office/company account.
   */
  submitReport: async (
    targetUserId: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/users/${targetUserId}/reports`, {
      reason,
      description,
    });
  },

  /** إبلاغ عن الإعلان: a report against a listing and its owner. */
  reportProperty: async (
    propertyId: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/properties/${propertyId}/reports`, {
      reason,
      description,
    });
  },

  /** A report against a review and its author. */
  reportReview: async (
    reviewId: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/reviews/${reviewId}/reports`, {
      reason,
      description,
    });
  },
};
