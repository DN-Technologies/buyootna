import { Injectable } from '@nestjs/common';
import { getOtpRateLimitConfig } from '../otp-rate-limiter/otp-rate-limiter.config';

const PENDING_TTL_MS = () =>
  getOtpRateLimitConfig().OTP_EXPIRY_MINUTES * 60 * 1000;

interface PendingPhoneRegistration {
  name: string;
  hashedPassword: string;
  expiresAt: Date;
}

/**
 * Holds not-yet-verified individual-signup attempts by phone, so no User row
 * is created until the Twilio Verify check succeeds — mirroring how
 * EmailOtpService's pending store defers email signups. The OTP code itself
 * never lives here: Twilio Verify owns it server-side, keyed by the phone
 * number. Same accepted trade-off as the email flow: in-memory (lost on API
 * restart, single-instance), which at worst means the user re-registers.
 */
@Injectable()
export class PhoneRegistrationPendingService {
  private readonly pending = new Map<string, PendingPhoneRegistration>();

  save(phone: string, name: string, hashedPassword: string): void {
    this.pending.set(phone, {
      name,
      hashedPassword,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS()),
    });
  }

  hasPending(phone: string): boolean {
    const record = this.pending.get(phone);
    return !!record && record.expiresAt > new Date();
  }

  /** Consumes the pending entry; returns null when absent or expired. */
  consume(phone: string): { name: string; hashedPassword: string } | null {
    const record = this.pending.get(phone);
    if (!record || record.expiresAt < new Date()) {
      return null;
    }

    this.pending.delete(phone);
    return { name: record.name, hashedPassword: record.hashedPassword };
  }
}
