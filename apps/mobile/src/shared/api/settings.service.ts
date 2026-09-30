import apiClient from '@/shared/api/api';

export interface UserSettingsResponse {
  id: string;
  userId: string;
  showPhone: boolean;
  showWhatsapp: boolean;
  hideActivity: boolean;
  hideOfficeAds: boolean;
}

export interface SuspendOtpResponse {
  channel: 'phone' | 'email';
  // Masked, e.g. "+965 •••• 88" or "a•••@gmail.com"
  destination: string;
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

  /** Sends the code confirming a temporary suspension (SMS, or email). */
  requestSuspendOtp: async (): Promise<SuspendOtpResponse> => {
    const response = await apiClient.post<SuspendOtpResponse>(
      '/users/account/suspend/request-otp',
    );
    return response.data;
  },

  /** Suspends the account; signing in again reactivates it. */
  suspendAccount: async (payload: {
    otp: string;
    reasons: string[];
    note?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>('/users/account/suspend', payload);
    return response.data;
  },

  // The current password is checked before a code is sent
  requestChangePasswordOtp: async (
    oldPassword: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/change-password/request-otp',
      { oldPassword },
    );
    return response.data;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
    otp?: string,
    logoutAllDevices?: boolean,
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      '/auth/change-password',
      {
        oldPassword,
        newPassword,
        otp,
        logoutAllDevices,
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
    services?: string;
  }): Promise<any> => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },
};
