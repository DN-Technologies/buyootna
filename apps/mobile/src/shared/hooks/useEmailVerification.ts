import { settingsService } from '@/shared/api/settings.service';

import { useOtpVerification } from './useOtpVerification';

// "Ali@X.com " and "ali@x.com" are one address
export function normalizeEmail(email?: string | null): string {
  return (email ?? '').trim().toLowerCase();
}

/**
 * Proving an email address with an emailed code before it becomes the
 * account's email (the API refuses an email change any other way).
 */
export function useEmailVerification(onVerified: (email: string) => void) {
  return useOtpVerification(
    {
      request: settingsService.requestEmailOtp,
      verify: settingsService.verifyEmail,
    },
    onVerified,
  );
}
