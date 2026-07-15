import apiClient from '@/core/api/api';

export interface UserSettingsResponse {
  id: string;
  userId: string;
  showPhone: boolean;
  showWhatsapp: boolean;
  hideActivity: boolean;
  hideOfficeAds: boolean;
}

export const settingsService = {
  getSettings: async (): Promise<UserSettingsResponse> => {
    const response = await apiClient.get<UserSettingsResponse>('/settings');
    return response.data;
  },

  updateSettings: async (
    dto: Partial<Omit<UserSettingsResponse, 'id' | 'userId'>>,
  ): Promise<UserSettingsResponse> => {
    const response = await apiClient.patch<UserSettingsResponse>(
      '/settings',
      dto,
    );
    return response.data;
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>('/users/account');
    return response.data;
  },

  disableAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
    }>('/users/account/disable');
    return response.data;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      '/auth/change-password',
      {
        oldPassword,
        newPassword,
      },
    );
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    avatarUrl?: string;
  }): Promise<any> => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },
};
