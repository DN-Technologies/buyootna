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
};
