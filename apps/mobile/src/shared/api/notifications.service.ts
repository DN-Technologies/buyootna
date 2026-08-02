import apiClient from '@/shared/api/api';

export interface NotificationPrefsResponse {
  id: string;
  userId: string;
  appEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
}

export type NotificationType = 'IDENTITY_APPROVED' | 'IDENTITY_REJECTED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  identityId: string | null;
  isRead: boolean;
  createdAt: string;
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

  list: async (): Promise<AppNotification[]> => {
    const response = await apiClient.get<AppNotification[]>('/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      '/notifications/unread-count',
    );
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<AppNotification> => {
    const response = await apiClient.patch<AppNotification>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
