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

// Which identifier password login accepts; BOTH = email or phone
export type LoginMethod = 'BOTH' | 'EMAIL' | 'PHONE';

export interface LoginMethodResponse {
  loginMethod: LoginMethod;
  email: string | null;
  phone: string | null;
  phoneVerified: boolean;
  message?: string;
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

  /**
   * Suspends the account; signing in again reactivates it, and a timed one
   * (durationDays) comes back on its own when the period ends.
   */
  suspendAccount: async (payload: {
    otp: string;
    reasons: string[];
    note?: string;
    durationDays?: 7 | 14 | 30;
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

  getLoginMethod: async (): Promise<LoginMethodResponse> => {
    const response = await apiClient.get<LoginMethodResponse>(
      '/users/account/login-method',
    );
    return response.data;
  },

  setLoginMethod: async (method: LoginMethod): Promise<LoginMethodResponse> => {
    const response = await apiClient.patch<LoginMethodResponse>(
      '/users/account/login-method',
      { method },
    );
    return response.data;
  },

  /** Texts a code to a phone number the user wants on their account. */
  requestPhoneOtp: async (phone: string): Promise<{ destination: string }> => {
    const response = await apiClient.post<{ destination: string }>(
      '/users/account/phone/request-otp',
      { phone },
    );
    return response.data;
  },

  /** With the right code the number becomes the account's verified phone. */
  verifyPhone: async (
    phone: string,
    otp: string,
  ): Promise<LoginMethodResponse> => {
    const response = await apiClient.post<LoginMethodResponse>(
      '/users/account/phone/verify',
      { phone, otp },
    );
    return response.data;
  },
};
