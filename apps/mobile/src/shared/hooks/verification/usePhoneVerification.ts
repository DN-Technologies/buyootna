import { settingsService } from '@/shared/api/settings.service';

import { useOtpVerification } from './useOtpVerification';

// Last 8 digits: "+96599998888", "96599998888" and "99998888" are one number
export function localPhone(phone?: string | null): string {
  return (phone ?? '').replace(/\D/g, '').slice(-8);
}

/**
 * Proving a phone number with an SMS code before it becomes the account's
 * phone (the API refuses a phone change any other way). start() sends the
 * code and opens the code sheet; the right code calls onVerified.
 */
export function usePhoneVerification(onVerified: (phone: string) => void) {
  return useOtpVerification(
    {
      request: settingsService.requestPhoneOtp,
      verify: settingsService.verifyPhone,
    },
    onVerified,
  );
}
