import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { otpVerificationTemplate } from '../mail/templates/otp-verification.template';

const OTP_TTL_MS = 10 * 60 * 1000;

interface PendingEmailRegistration {
  hashedPassword: string;
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

  constructor(private readonly mailService: MailService) {}

  async sendRegistrationOtp(
    email: string,
    hashedPassword: string,
  ): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.pending.set(email, {
      hashedPassword,
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    if (this.mailService.isMockMode) {
      this.logger.warn(
        `[MOCK MAIL] Resend is disabled or unconfigured. OTP code for ${email}: ${otp}`,
      );
    }

    await this.mailService.sendMail({
      to: email,
      subject: 'رمز التحقق من بريدك الإلكتروني - Buyootna',
      html: otpVerificationTemplate({ userName: email, otp }),
    });
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

  /** Validates the OTP and, if correct, consumes the pending entry and returns its stored password hash. */
  verifyAndConsume(
    email: string,
    otp: string,
  ): { hashedPassword: string } | null {
    const record = this.pending.get(email);
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return null;
    }

    this.pending.delete(email);
    return { hashedPassword: record.hashedPassword };
  }
}
