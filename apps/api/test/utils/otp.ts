import { INestApplication } from '@nestjs/common';

import { TwilioService } from '../../src/core/twilio/twilio.service';

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
    twilioService as unknown as { mockCodes: Map<string, string> }
  ).mockCodes;
  const code = mockCodes.get(formattedPhone);

  if (!code) {
    throw new Error(
      `No mock OTP code found for ${formattedPhone}. Was sendVerification/requestOtp called for this phone first?`,
    );
  }

  return code;
}
