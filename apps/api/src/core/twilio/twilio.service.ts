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

// While QA tests the app the server makes SMS codes itself so the testing
// portal can show them. TESTING_SHOW_SMS_CODES=false turns that off: Twilio
// Verify makes the code again and nobody but the phone sees it.
const showSmsCodesOnPortal = () =>
  process.env.TESTING_SHOW_SMS_CODES !== 'false';

// QA test numbers: phones starting with one of these E.164 prefixes (comma
// separated, e.g. "+9655000") get no SMS at all; the code only appears on
// the testing portal's الرموز. Unset: none. A prefix must name the country
// and at least 4 more digits, so "+965" alone can't make every Kuwaiti
// number a test number. Off with TESTING_SHOW_SMS_CODES=false (the code
// would be unseen, and so unusable).
const MIN_TEST_PREFIX_LENGTH = 8;
export const testNumberPrefixes = (): string[] =>
  (process.env.TESTING_SMS_TEST_NUMBERS ?? '')
    .split(',')
    .map((prefix) => prefix.replace(/[\s\-()]/g, ''))
    .filter((prefix) => /^\+\d+$/.test(prefix))
    .filter((prefix) => prefix.length >= MIN_TEST_PREFIX_LENGTH);
const isTestNumber = (formattedPhone: string) =>
  showSmsCodesOnPortal() &&
  testNumberPrefixes().some((prefix) => formattedPhone.startsWith(prefix));

// Our own SMS, the way email codes go: the server makes the code, sends it
// as a plain message and checks it, so the testing portal can show it with
// no Twilio Verify custom-code permission. A Messaging Service SID (MG…) or
// a sender (registered alphanumeric ID or Twilio number). Unset: Verify.
const smsSender = ():
  { messagingServiceSid: string } | { from: string } | null => {
  const value = process.env.TWILIO_SMS_FROM?.trim();
  if (!value) return null;
  return /^MG[0-9a-f]{32}$/i.test(value)
    ? { messagingServiceSid: value }
    : { from: value };
};

/** The SMS a code goes out in (Arabic, like the app). */
export const smsCodeBody = (code: string, minutes: number) =>
  `رمز التحقق في بيوتنا: ${code}\nصالح لمدة ${minutes} دقائق. لا تشاركه مع أحد.`;

// Twilio's answer when custom codes aren't enabled for the account (or the
// parameter is otherwise rejected): fall back to Verify's own code
function isCustomCodeRefused(error: unknown): boolean {
  const e = error as { code?: number; message?: string };
  return e?.code === 60200 || /custom ?code/i.test(e?.message ?? '');
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio.Twilio | null = null;
  private serviceSid: string | null = null;
  // TWILIO_SMS_FROM: codes go as our own SMS instead of through Verify
  private sender: { messagingServiceSid: string } | { from: string } | null =
    null;
  // Dev-only (see mockSmsAllowed): codes generated in mock SMS mode, keyed
  // by formatted phone number, so checkVerification can validate them.
  private readonly mockCodes = new Map<
    string,
    { code: string; expiresAt: Date }
  >();

  // Codes this server made, keyed by phone: handed to Verify (customCode,
  // with its verificationSid, which Twilio expects reported approved) or sent
  // as our own SMS (no verificationSid). Checked here, in memory only, until
  // used, replaced or expired.
  private readonly customCodes = new Map<
    string,
    { code: string; verificationSid: string | null; expiresAt: Date }
  >();

  /** Codes go as our own SMS (TWILIO_SMS_FROM), not through Verify. */
  get sendsOwnSms(): boolean {
    return this.twilioClient !== null && this.sender !== null;
  }

  /** Real SMS (Verify or our own), or mock codes in the log (false). */
  get isConfigured(): boolean {
    return (
      this.twilioClient !== null &&
      (this.sender !== null || this.serviceSid !== null)
    );
  }

  constructor(
    // The testing portal's الرموز feed (absent in some unit tests)
    @Optional() private readonly feed?: OtpFeedService,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    const sender = smsSender();

    if (accountSid && authToken && (serviceSid || sender)) {
      try {
        this.twilioClient = Twilio(accountSid, authToken);
        this.serviceSid = serviceSid ?? null;
        this.sender = sender;
        this.logger.log(
          sender
            ? 'Twilio initialized: codes go as our own SMS (TWILIO_SMS_FROM)'
            : 'Twilio Verify client initialized successfully',
        );
      } catch (err) {
        this.logger.error('Failed to initialize Twilio client:', err);
      }
    } else if (mockSmsAllowed()) {
      this.logger.warn(
        'Twilio credentials missing in environment variables. Falling back to mock SMS mode.',
      );
    } else {
      this.logger.error(
        'Twilio credentials missing in production: SMS codes are disabled until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_SMS_FROM or TWILIO_VERIFY_SERVICE_SID are set.',
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

    if (isTestNumber(formattedPhone)) {
      return this.keepTestNumberCode(formattedPhone, purpose);
    }

    if (!this.twilioClient || !this.isConfigured) {
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

    if (this.sender) {
      return this.sendOwnSms(
        formattedPhone,
        purpose,
        this.twilioClient,
        this.sender,
      );
    }

    try {
      // The code is made here and handed to Verify (customCode), which still
      // delivers and checks it, so the testing portal's الرموز can show it
      // (owner's decision: every user's OTP is shown, see
      // docs/ai/security-policy.md). An account without custom codes
      // enabled refuses that; then Verify makes the code, unseen.
      const customCode = showSmsCodesOnPortal()
        ? randomInt(100000, 1000000).toString()
        : null;
      let code: string | null = customCode;
      let verification: { sid: string; status: string };
      try {
        verification = await this.twilioClient.verify.v2
          .services(this.serviceSid!)
          .verifications.create({
            to: formattedPhone,
            channel: 'sms',
            ...(customCode ? { customCode } : {}),
          });
      } catch (error: unknown) {
        if (!customCode || !isCustomCodeRefused(error)) throw error;
        this.logger.warn(
          'Twilio Verify refused a custom code (not enabled on the account): sending its own code instead',
        );
        code = null;
        verification = await this.twilioClient.verify.v2
          .services(this.serviceSid!)
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
   * A QA test number (TESTING_SMS_TEST_NUMBERS): no SMS; the code is kept
   * here and shown on the portal's الرموز only. Never logged.
   */
  private keepTestNumberCode(
    formattedPhone: string,
    purpose: OtpPurpose,
  ): { success: boolean } {
    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS());
    this.customCodes.set(formattedPhone, {
      code,
      verificationSid: null,
      expiresAt,
    });
    this.logger.log(
      `QA test number ${formattedPhone}: no SMS sent, code on the testing portal`,
    );
    this.feed?.recordSent({
      channel: 'SMS',
      purpose,
      recipient: formattedPhone,
      code,
      provider: 'mock-sms',
      expiresAt,
    });
    return { success: true };
  }

  /**
   * The code kept for this phone, if `code` is it and still valid: used up
   * and returned. null otherwise (wrong, expired or none).
   */
  private useKeptCode(
    formattedPhone: string,
    code: string,
  ): { verificationSid: string | null } | null {
    const kept = this.customCodes.get(formattedPhone);
    if (!kept) return null;
    if (kept.expiresAt <= new Date()) {
      this.customCodes.delete(formattedPhone);
      return null;
    }
    if (kept.code !== code) return null;
    this.customCodes.delete(formattedPhone);
    this.feed?.recordPhoneUsed(formattedPhone);
    return { verificationSid: kept.verificationSid };
  }

  /**
   * TWILIO_SMS_FROM: the code is made here and sent as a plain SMS, the way
   * email codes are, then checked here (checkVerification). The portal shows
   * it unless TESTING_SHOW_SMS_CODES=false.
   */
  private async sendOwnSms(
    formattedPhone: string,
    purpose: OtpPurpose,
    client: Twilio.Twilio,
    sender: { messagingServiceSid: string } | { from: string },
  ): Promise<{ success: boolean }> {
    const code = randomInt(100000, 1000000).toString();
    const ttlMs = OTP_TTL_MS();
    try {
      const message = await client.messages.create({
        to: formattedPhone,
        body: smsCodeBody(code, Math.round(ttlMs / 60000)),
        ...sender,
      });
      const expiresAt = new Date(Date.now() + ttlMs);
      // A new code replaces the previous one for this phone
      this.customCodes.set(formattedPhone, {
        code,
        verificationSid: null,
        expiresAt,
      });
      this.logger.log(
        `OTP SMS sent to ${formattedPhone}. Status: ${message.status}`,
      );
      this.feed?.recordSent({
        channel: 'SMS',
        purpose,
        recipient: formattedPhone,
        code: showSmsCodesOnPortal() ? code : null,
        provider: 'twilio',
        expiresAt,
      });
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send OTP SMS to ${formattedPhone}: ${message}`,
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

    // A QA test number: only the code kept for it, Twilio or not
    if (isTestNumber(formattedPhone)) {
      return this.useKeptCode(formattedPhone, code) !== null;
    }

    if (!this.twilioClient || !this.isConfigured) {
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
      // Our own SMS: nothing to report to Twilio
      if (!custom.verificationSid || !this.serviceSid) return true;
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

    // Our own SMS: only the codes kept above are valid
    if (this.sender || !this.serviceSid) return false;

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
