import { Injectable, Logger, Optional } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { otpVerificationTemplate } from '../mail/templates/otp-verification.template';
import { accountSuspendOtpTemplate } from '../mail/templates/account-suspend-otp.template';
import { emailChangeOtpTemplate } from '../mail/templates/email-change-otp.template';
import { passwordResetOtpTemplate } from '../mail/templates/password-reset-otp.template';
import { OtpRateLimiterService } from '../otp-rate-limiter/otp-rate-limiter.service';
import { getOtpRateLimitConfig } from '../otp-rate-limiter/otp-rate-limiter.config';
import { OtpFeedService, OtpPurpose } from '../otp-feed/otp-feed.service';

const OTP_TTL_MS = () => getOtpRateLimitConfig().OTP_EXPIRY_MINUTES * 60 * 1000;

interface PendingEmailRegistration {
  name: string;
  hashedPassword: string;
  otp: string;
  expiresAt: Date;
}

interface PendingPasswordReset {
  otp: string;
  expiresAt: Date;
}

/**
 * Holds not-yet-verified individual-signup attempts by email, so no User row
 * is created until the OTP is confirmed. Mirrors TwilioService's in-memory
 * mockCodes map, but this is the actual store (not just a mock fallback) —
 * there's no durable "pending registration" table, and a short-lived,
 * in-memory pending signup is an acceptable trade-off for this app's scale.
 */
@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);
  private readonly pending = new Map<string, PendingEmailRegistration>();
  // Separate from `pending` (registration) so a password-reset request never
  // collides with, or gets consumed by, an unrelated pending signup for the
  // same address.
  private readonly pendingResets = new Map<string, PendingPasswordReset>();
  // Codes confirming a self-suspension, keyed by the account's email
  private readonly pendingSuspends = new Map<string, PendingPasswordReset>();
  // Codes proving an address a signed-in user wants on their account, keyed
  // by user and address so a code only ever confirms that pair
  private readonly pendingEmailChanges = new Map<
    string,
    PendingPasswordReset
  >();

  constructor(
    private readonly mailService: MailService,
    private readonly rateLimiter?: OtpRateLimiterService,
    // The testing portal's الرموز feed (absent in some unit tests)
    @Optional() private readonly feed?: OtpFeedService,
  ) {}

  /** Lists a sent code in the testing portal's feed. */
  private toFeed(
    purpose: OtpPurpose,
    email: string,
    otp: string,
    expiresAt: Date,
    key?: string,
  ) {
    this.feed?.recordSent({
      channel: 'EMAIL',
      purpose,
      recipient: email,
      code: otp,
      provider: this.mailService.isMockMode ? 'mock-mail' : 'resend',
      expiresAt,
      key,
    });
  }

  async sendRegistrationOtp(
    email: string,
    name: string,
    hashedPassword: string,
  ): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.pending.set(email, {
      name,
      hashedPassword,
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS()),
    });

    if (this.mailService.isMockMode) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. OTP code for ${email}: ${otp}`,
      );
    }

    await this.mailService.sendMail({
      to: email,
      subject: 'رمز التحقق من بريدك الإلكتروني - Buyootna',
      html: otpVerificationTemplate({ userName: name, otp }),
    });
    this.toFeed('SIGNUP', email, otp, this.pending.get(email)!.expiresAt);

    this.rateLimiter?.recordRequest(email);
  }

  hasPending(email: string): boolean {
    const record = this.pending.get(email);
    return !!record && record.expiresAt > new Date();
  }

  /**
   * Dev/CI-only accessor for a pending signup's OTP, for black-box e2e
   * flows (Maestro) that drive the app in a separate process and can't
   * reach into memory like the Jest e2e specs do. Only meaningful in mock
   * mail mode — the controller endpoint that exposes this 404s otherwise.
   */
  getMockOtp(email: string): string | null {
    return this.mailService.isMockMode
      ? (this.pending.get(email)?.otp ?? null)
      : null;
  }

  /** Validates the OTP and, if correct, consumes the pending entry and returns its stored name + password hash. */
  verifyAndConsume(
    email: string,
    otp: string,
  ): { name: string; hashedPassword: string } | null {
    const record = this.pending.get(email);
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return null;
    }

    this.pending.delete(email);
    this.feed?.recordUsed('EMAIL', 'SIGNUP', email);
    return { name: record.name, hashedPassword: record.hashedPassword };
  }

  /** Sends a password-reset OTP to an existing account's email address. */
  async sendPasswordResetOtp(email: string, userName: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.pendingResets.set(email, {
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS()),
    });

    if (this.mailService.isMockMode) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. Password-reset OTP for ${email}: ${otp}`,
      );
    }

    await this.mailService.sendMail({
      to: email,
      subject: 'رمز إعادة تعيين كلمة المرور - Buyootna',
      html: passwordResetOtpTemplate({ userName, otp }),
    });
    this.toFeed(
      'PASSWORD_RESET',
      email,
      otp,
      this.pendingResets.get(email)!.expiresAt,
    );

    this.rateLimiter?.recordRequest(email);
  }

  /** Dev/CI-only accessor for a pending password-reset OTP, mirroring getMockOtp. */
  getMockPasswordResetOtp(email: string): string | null {
    return this.mailService.isMockMode
      ? (this.pendingResets.get(email)?.otp ?? null)
      : null;
  }

  /** Validates a password-reset OTP and, if correct, consumes it. */
  verifyPasswordResetOtp(email: string, otp: string): boolean {
    const record = this.pendingResets.get(email);
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return false;
    }

    this.pendingResets.delete(email);
    this.feed?.recordUsed('EMAIL', 'PASSWORD_RESET', email);
    return true;
  }

  /** Sends the code confirming "suspend my account" to an email-only account. */
  async sendAccountSuspendOtp(email: string, userName: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.pendingSuspends.set(email, {
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS()),
    });

    if (this.mailService.isMockMode) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. Account-suspend OTP for ${email}: ${otp}`,
      );
    }

    await this.mailService.sendMail({
      to: email,
      subject: 'رمز تأكيد تعطيل الحساب - Buyootna',
      html: accountSuspendOtpTemplate({ userName, otp }),
    });
    this.toFeed(
      'ACCOUNT_SUSPEND',
      email,
      otp,
      this.pendingSuspends.get(email)!.expiresAt,
    );
    // Rate limiting is keyed by user id by the caller (AccountSuspension)
  }

  /** Dev/CI-only accessor for a pending account-suspend OTP. */
  getMockAccountSuspendOtp(email: string): string | null {
    return this.mailService.isMockMode
      ? (this.pendingSuspends.get(email)?.otp ?? null)
      : null;
  }

  /** Validates an account-suspend OTP and, if correct, consumes it. */
  verifyAccountSuspendOtp(email: string, otp: string): boolean {
    const record = this.pendingSuspends.get(email);
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return false;
    }

    this.pendingSuspends.delete(email);
    this.feed?.recordUsed('EMAIL', 'ACCOUNT_SUSPEND', email);
    return true;
  }

  private emailChangeKey(userId: string, email: string): string {
    return `${userId}:${email}`;
  }

  /** Sends the code proving `email` before it becomes the user's address. */
  async sendEmailChangeOtp(
    userId: string,
    email: string,
    userName: string,
  ): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.pendingEmailChanges.set(this.emailChangeKey(userId, email), {
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS()),
    });

    if (this.mailService.isMockMode) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. Email-change OTP for ${email}: ${otp}`,
      );
    }

    await this.mailService.sendMail({
      to: email,
      subject: 'رمز التحقق من البريد الإلكتروني - Buyootna',
      html: emailChangeOtpTemplate({ userName, otp }),
    });
    const changeKey = this.emailChangeKey(userId, email);
    this.toFeed(
      'EMAIL_CHANGE',
      email,
      otp,
      this.pendingEmailChanges.get(changeKey)!.expiresAt,
      `EMAIL:EMAIL_CHANGE:${changeKey}`,
    );
    // Rate limiting is keyed by user id by the caller (LoginMethodService)
  }

  /** Dev/CI-only accessor for a pending email-change OTP. */
  getMockEmailChangeOtp(userId: string, email: string): string | null {
    return this.mailService.isMockMode
      ? (this.pendingEmailChanges.get(this.emailChangeKey(userId, email))
          ?.otp ?? null)
      : null;
  }

  /** Validates an email-change OTP and, if correct, consumes it. */
  verifyEmailChangeOtp(userId: string, email: string, otp: string): boolean {
    const key = this.emailChangeKey(userId, email);
    const record = this.pendingEmailChanges.get(key);
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return false;
    }

    this.pendingEmailChanges.delete(key);
    this.feed?.recordUsed(
      'EMAIL',
      'EMAIL_CHANGE',
      email,
      `EMAIL:EMAIL_CHANGE:${key}`,
    );
    return true;
  }
}
