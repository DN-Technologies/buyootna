export type DeactivateStep = 'intro' | 'reasons' | 'otp';

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 45;

export const DEACTIVATE_REASONS = [
  { id: 'temp_break', title: 'استراحة مؤقتة' },
  { id: 'not_using', title: 'لا أستخدم التطبيق حاليًا' },
  { id: 'technical', title: 'مشاكل تقنية' },
  { id: 'other', title: 'أخرى' },
] as const;

export const OTHER_REASON_ID = 'other';

// How long the account stays off; null = until the user signs in again.
// The API reactivates a timed one on its own when the period ends.
export const DEACTIVATE_DURATIONS = [
  { days: null, title: 'حتى أعود' },
  { days: 7, title: '7 أيام' },
  { days: 14, title: '14 يوم' },
  { days: 30, title: '30 يوم' },
] as const;

export type DeactivateDuration = (typeof DEACTIVATE_DURATIONS)[number]['days'];
