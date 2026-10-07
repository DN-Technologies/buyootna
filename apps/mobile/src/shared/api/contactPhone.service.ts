import apiClient from '@/shared/api/api';

/** The active persona's contact phone (رقم التواصل). */
export interface ContactPhoneState {
  // On: people reach this persona on the account's phone
  useAccountPhone: boolean;
  accountPhone: string | null;
  // This persona's own number (SMS-verified), used when the box is off
  contactPhone: string | null;
  contactPhoneVerified: boolean;
  // What people actually see and call
  effectivePhone: string | null;
}

export const contactPhoneService = {
  get: async (): Promise<ContactPhoneState> => {
    const response = await apiClient.get<ContactPhoneState>(
      '/identities/current/contact-phone',
    );
    return response.data;
  },

  /** Texts a code to the number this persona should be reached on. */
  requestOtp: async (phone: string): Promise<{ destination: string }> => {
    const response = await apiClient.post<{ destination: string }>(
      '/identities/current/contact-phone/request-otp',
      { phone },
    );
    return response.data;
  },

  /** With the right code the number becomes this persona's own. */
  verify: async (phone: string, otp: string): Promise<ContactPhoneState> => {
    const response = await apiClient.post<ContactPhoneState>(
      '/identities/current/contact-phone/verify',
      { phone, otp },
    );
    return response.data;
  },

  /** The checkbox: the account's phone, or the persona's own verified one. */
  setUseAccountPhone: async (
    useAccountPhone: boolean,
  ): Promise<ContactPhoneState> => {
    const response = await apiClient.patch<ContactPhoneState>(
      '/identities/current/contact-phone',
      { useAccountPhone },
    );
    return response.data;
  },
};
