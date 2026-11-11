import { Injectable } from '@nestjs/common';
import { IdentityType } from '@prisma/client';
import { getOtpRateLimitConfig } from '../../../core/otp-rate-limiter/otp-rate-limiter.config';

type ProviderType = typeof IdentityType.COMPANY | typeof IdentityType.OFFICE;

/** A company/office signup waiting for its email code (no account yet). */
export interface PendingProviderRegistration {
  type: ProviderType;
  // The signup form, without the password
  data: Record<string, unknown>;
  hashedPassword: string;
  // Logo / licence already uploaded, removed if the signup is abandoned
  uploaded: { logoUrl?: string; licenseFileUrl?: string };
  expiresAt: Date;
}

/**
 * Company/office signups held in memory until the emailed code is entered,
 * like individual signups: nothing is written to the database before the
 * email is proven (QA: a company was created with a fake email).
 */
@Injectable()
export class ProviderRegistrationPendingService {
  private readonly pending = new Map<string, PendingProviderRegistration>();

  private ttlMs() {
    return getOtpRateLimitConfig().OTP_EXPIRY_MINUTES * 60 * 1000;
  }

  private key(email: string) {
    return email.trim().toLowerCase();
  }

  /** Holds a signup; returns the one it replaced (its uploads to remove). */
  save(
    email: string,
    entry: Omit<PendingProviderRegistration, 'expiresAt'>,
  ): PendingProviderRegistration | null {
    const previous = this.pending.get(this.key(email)) ?? null;
    this.pending.set(this.key(email), {
      ...entry,
      expiresAt: new Date(Date.now() + this.ttlMs()),
    });
    return previous;
  }

  /** The signup for this email and type, once; null if none or expired. */
  consume(
    email: string,
    type: ProviderType,
  ): PendingProviderRegistration | null {
    const entry = this.pending.get(this.key(email));
    if (!entry || entry.type !== type) return null;
    this.pending.delete(this.key(email));
    return entry.expiresAt > new Date() ? entry : null;
  }
}
