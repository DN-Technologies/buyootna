import apiClient from '@/shared/api/api';

export interface NotificationPrefsResponse {
  id: string;
  userId: string;
  appEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
}

export type NotificationType =
  | 'IDENTITY_APPROVED'
  | 'IDENTITY_REJECTED'
  | 'IDENTITY_EDIT_REQUESTED'
  | 'ADMIN_CUSTOM_MESSAGE'
  | 'ALERT_MATCH'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISMISSED'
  | 'NEW_DEVICE_LOGIN';

// What a notification points at, e.g. the matched listing for ALERT_MATCH
export interface NotificationData {
  propertyId?: string;
  // NEW_DEVICE_LOGIN: the session that just signed in
  sessionId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  identityId: string | null;
  isRead: boolean;
  data?: NotificationData | null;
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

  markAsUnread: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/unread`);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
