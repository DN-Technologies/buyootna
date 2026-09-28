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
