import { INestApplication } from '@nestjs/common';

import { TwilioService } from '../../src/core/twilio/twilio.service';
import { EmailOtpService } from '../../src/core/email-otp/email-otp.service';

/**
 * Reads a mock OTP code straight out of TwilioService's in-memory map — the
 * only place it exists, since mock mode never returns the code over HTTP.
 * No production code changes needed; this reaches into the private field
 * via a narrow, test-only cast.
 */
export function getMockOtpCode(app: INestApplication, phone: string): string {
  const twilioService = app.get(TwilioService);
  const formattedPhone = twilioService.formatPhoneNumber(phone);
  const mockCodes = (
    twilioService as unknown as {
      mockCodes: Map<string, { code: string; expiresAt: Date } | string>;
    }
  ).mockCodes;
  const record = mockCodes.get(formattedPhone);

  if (!record) {
    throw new Error(
      `No mock OTP code found for ${formattedPhone}. Was sendVerification/requestOtp called for this phone first?`,
    );
  }

  return typeof record === 'string' ? record : record.code;
}

/**
 * Reads a pending email-registration OTP straight out of EmailOtpService's
 * in-memory map — same reasoning as getMockOtpCode above, but for the
 * verify-before-create email signup flow.
 */
export function getMockEmailOtpCode(
  app: INestApplication,
  email: string,
): string {
  const emailOtpService = app.get(EmailOtpService);
  const pending = (
    emailOtpService as unknown as {
      pending: Map<string, { otp: string }>;
    }
  ).pending;
  const record = pending.get(email);

  if (!record) {
    throw new Error(
      `No pending email OTP found for ${email}. Was registerIndividual called for this email first?`,
    );
  }

  return record.otp;
}

/**
 * Reads a pending password-reset OTP for an email-only account via
 * EmailOtpService's public getMockPasswordResetOtp accessor (mirrors the
 * dev/CI-only /auth/recovery/debug-email-otp endpoint, but reads it
 * in-process instead of over HTTP).
 */
export function getMockPasswordResetOtpCode(
  app: INestApplication,
  email: string,
): string {
  const emailOtpService = app.get(EmailOtpService);
  const otp = emailOtpService.getMockPasswordResetOtp(email);

  if (!otp) {
    throw new Error(
      `No pending password-reset OTP found for ${email}. Was recovery/request-otp called for this email first?`,
    );
  }

  return otp;
}
