import apiClient from '@/core/api/api';

export interface NotificationPrefsResponse {
  id: string;
  userId: string;
  appEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
}

export const notificationsService = {
  getPreferences: async (): Promise<NotificationPrefsResponse> => {
    const response = await apiClient.get<NotificationPrefsResponse>('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (dto: Partial<Omit<NotificationPrefsResponse, 'id' | 'userId'>>): Promise<NotificationPrefsResponse> => {
    const response = await apiClient.patch<NotificationPrefsResponse>('/notifications/preferences', dto);
    return response.data;
  },
};
