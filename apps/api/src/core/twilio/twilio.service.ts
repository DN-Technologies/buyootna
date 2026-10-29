import {
  Injectable,
  Logger,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import Twilio from 'twilio';
import { getOtpRateLimitConfig } from '../otp-rate-limiter/otp-rate-limiter.config';
import { OtpFeedService, OtpPurpose } from '../otp-feed/otp-feed.service';

const OTP_TTL_MS = () => getOtpRateLimitConfig().OTP_EXPIRY_MINUTES * 60 * 1000;

// Mock SMS (codes only in the server log) is for development. In production
// it would let anyone who can read logs sign in, and real users never get
// a code -- so there it's refused unless explicitly allowed.
const mockSmsAllowed = () =>
  process.env.NODE_ENV !== 'production' ||
  process.env.ALLOW_MOCK_SMS === 'true';

// Twilio's answer when custom codes aren't enabled for the account (or the
// parameter is otherwise rejected): fall back to Verify's own code
function isCustomCodeRefused(error: unknown): boolean {
  const e = error as { code?: number; message?: string };
  return (
    e?.code === 60200 ||
    /custom ?code/i.test(e?.message ?? '')
  );
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio.Twilio | null = null;
  private serviceSid: string | null = null;
  // Dev-only (see mockSmsAllowed): codes generated in mock SMS mode, keyed
  // by formatted phone number, so checkVerification can validate them.
  private readonly mockCodes = new Map<
    string,
    { code: string; expiresAt: Date }
  >();

  // Codes this server made and handed to Verify (customCode), keyed by
  // phone. With custom codes Twilio expects the app to check the code and
  // report it approved, so they're kept here (in memory only) until used,
  // replaced or expired.
  private readonly customCodes = new Map<
    string,
    { code: string; verificationSid: string; expiresAt: Date }
  >();

  /** Real Twilio Verify (true), or mock codes in the log (false). */
  get isConfigured(): boolean {
    return this.twilioClient !== null && this.serviceSid !== null;
  }

  constructor(
    // The testing portal's الرموز feed (absent in some unit tests)
    @Optional() private readonly feed?: OtpFeedService,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (accountSid && authToken && serviceSid) {
      try {
        this.twilioClient = Twilio(accountSid, authToken);
        this.serviceSid = serviceSid;
        this.logger.log('Twilio Verify client initialized successfully');
      } catch (err) {
        this.logger.error('Failed to initialize Twilio client:', err);
      }
    } else if (mockSmsAllowed()) {
      this.logger.warn(
        'Twilio credentials missing in environment variables. Falling back to mock SMS mode.',
      );
    } else {
      this.logger.error(
        'Twilio credentials missing in production: SMS codes are disabled until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID are set.',
      );
    }
  }

  /**
   * Format phone numbers into standard E.164 format.
   * Defaults Kuwait 8-digit numbers to +965.
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2);
    }
    // Handle local 8-digit Kuwait numbers (e.g. 99998888 -> +96599998888)
    if (cleaned.length === 8) {
      return `+965${cleaned}`;
    }
    return `+${cleaned}`;
  }

  /**
   * Send an OTP verification SMS using Twilio Verify API.
   *
   * Does not record this against the OTP request rate limiter -- callers
   * key that by whatever field their own @OtpRequestRateLimit guard
   * checks (a raw identifier, a phone, a userId, ...), which this generic
   * "just send it" method has no way to know. Call
   * OtpRateLimiterService.recordRequest() with that same key yourself
   * after a successful send.
   */
  async sendVerification(
    phone: string,
    // What the code is for, shown on the testing portal's الرموز feed
    purpose: OtpPurpose = 'OTHER',
  ): Promise<{ success: boolean }> {
    const formattedPhone = this.formatPhoneNumber(phone);

    if (!this.twilioClient || !this.serviceSid) {
      if (!mockSmsAllowed()) {
        throw new ServiceUnavailableException(
          'خدمة الرسائل النصية غير متاحة حالياً، يرجى المحاولة لاحقاً',
        );
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.mockCodes.set(formattedPhone, {
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS()),
      });
      this.logger.warn(
        `[MOCK SMS] Twilio is disabled or unconfigured. OTP code for ${formattedPhone}: ${code}`,
      );
      this.feed?.recordSent({
        channel: 'SMS',
        purpose,
        recipient: formattedPhone,
        code,
        provider: 'mock-sms',
        expiresAt: new Date(Date.now() + OTP_TTL_MS()),
      });
      return { success: true };
    }

    try {
      // The code is made here and handed to Verify (customCode), which still
      // delivers and checks it, so the testing portal's الرموز can show it
      // (owner's decision: every user's OTP is shown, see
      // docs/ai/security-policy.md). An account without custom codes
      // enabled refuses that; then Verify makes the code, unseen.
      const customCode = randomInt(100000, 1000000).toString();
      let code: string | null = customCode;
      let verification: { sid: string; status: string };
      try {
        verification = await this.twilioClient.verify.v2
          .services(this.serviceSid)
          .verifications.create({
            to: formattedPhone,
            channel: 'sms',
            customCode,
          });
      } catch (error: unknown) {
        if (!isCustomCodeRefused(error)) throw error;
        this.logger.warn(
          'Twilio Verify refused a custom code (not enabled on the account): sending its own code instead',
        );
        code = null;
        verification = await this.twilioClient.verify.v2
          .services(this.serviceSid)
          .verifications.create({ to: formattedPhone, channel: 'sms' });
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      if (code) {
        // A new code replaces the previous one for this phone
        this.customCodes.set(formattedPhone, {
          code,
          verificationSid: verification.sid,
          expiresAt,
        });
      } else {
        this.customCodes.delete(formattedPhone);
      }

      this.logger.log(
        `Twilio OTP verification sent to ${formattedPhone}. Status: ${verification.status}`,
      );
      this.feed?.recordSent({
        channel: 'SMS',
        purpose,
        recipient: formattedPhone,
        code,
        provider: 'twilio',
        expiresAt,
      });
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send Twilio verification to ${formattedPhone}: ${message}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check an OTP verification code using Twilio Verify API.
   */
  async checkVerification(phone: string, code: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(phone);

    if (!this.twilioClient || !this.serviceSid) {
      if (!mockSmsAllowed()) return false;
      const record = this.mockCodes.get(formattedPhone);
      const isValid =
        !!record && record.code === code && record.expiresAt > new Date();
      this.logger.warn(
        `[MOCK SMS] Twilio is unconfigured. Verification check for ${formattedPhone} with code ${code}: ${isValid ? 'valid' : 'invalid'}.`,
      );
      if (isValid) {
        this.mockCodes.delete(formattedPhone);
        this.feed?.recordPhoneUsed(formattedPhone);
      }
      return isValid;
    }

    // Our own code: checked here, then reported approved to Twilio (Verify
    // feedback, required with custom codes)
    const custom = this.customCodes.get(formattedPhone);
    if (custom) {
      if (custom.expiresAt <= new Date()) {
        this.customCodes.delete(formattedPhone);
        return false;
      }
      if (custom.code !== code) return false;
      this.customCodes.delete(formattedPhone);
      this.feed?.recordPhoneUsed(formattedPhone);
      try {
        await this.twilioClient.verify.v2
          .services(this.serviceSid)
          .verifications(custom.verificationSid)
          .update({ status: 'approved' });
      } catch (error: unknown) {
        // Feedback only: the user is verified either way
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Could not report verification ${custom.verificationSid} approved to Twilio: ${message}`,
        );
      }
      return true;
    }

    try {
      const check = await this.twilioClient.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: formattedPhone,
          code,
        });

      this.logger.log(
        `Twilio verification check for ${formattedPhone}. Status: ${check.status}`,
      );
      const approved = check.status === 'approved';
      if (approved) this.feed?.recordPhoneUsed(formattedPhone);
      return approved;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to verify Twilio OTP for ${formattedPhone}: ${message}`,
        error,
      );
      return false;
    }
  }
}
