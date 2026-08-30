import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  getOtpRateLimitConfig,
  OTP_RATE_LIMIT,
} from './otp-rate-limiter.config';

interface RateLimitEntry {
  /** Timestamps (ms) of OTP-request calls within the current rolling hour. */
  requestTimestamps: number[];
  /** Count of failed verification attempts for the current OTP. */
  verifyAttempts: number;
  /** When true, all further verify calls for this key are rejected. */
  blocked: boolean;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * In-memory OTP rate limiter.
 *
 * Tracks per-identifier request frequency (cooldown + hourly cap) and
 * per-identifier verification attempt counts. Designed for single-instance
 * deployments; swap the Map-based store for Redis when horizontal scaling
 * is needed.
 */
@Injectable()
export class OtpRateLimiterService {
  private readonly logger = new Logger(OtpRateLimiterService.name);
  private readonly store = new Map<string, RateLimitEntry>();

  /** Periodic cleanup of stale entries (every 10 minutes). */
  private readonly cleanupInterval = setInterval(
    () => this.cleanup(),
    10 * 60 * 1000,
  );

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  // ─── OTP Request Limits ────────────────────────────────────────────

  /**
   * Enforces the 60-second cooldown and hourly cap before a new OTP is sent.
   * Call this BEFORE actually generating / sending the OTP.
   *
   * @throws HttpException 429 if the limit is exceeded.
   */
  checkRequestLimit(key: string): void {
    const entry = this.getOrCreate(key);
    const now = Date.now();

    const config = getOtpRateLimitConfig();

    // Prune timestamps older than 1 hour
    entry.requestTimestamps = entry.requestTimestamps.filter(
      (ts) => now - ts < ONE_HOUR_MS,
    );

    // Cooldown check: last request must be >= COOLDOWN seconds ago
    const last = entry.requestTimestamps.at(-1);
    if (
      config.REQUEST_COOLDOWN_SECONDS > 0 &&
      last !== undefined &&
      now - last < config.REQUEST_COOLDOWN_SECONDS * 1000
    ) {
      const waitSeconds = Math.ceil(
        (config.REQUEST_COOLDOWN_SECONDS * 1000 - (now - last)) / 1000,
      );
      this.logger.warn(
        `OTP request cooldown hit for key="${key}". Must wait ${waitSeconds}s.`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `يرجى الانتظار ${waitSeconds} ثانية قبل طلب رمز تحقق جديد`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Hourly cap check
    if (entry.requestTimestamps.length >= config.MAX_REQUESTS_PER_HOUR) {
      this.logger.warn(
        `OTP hourly request cap reached for key="${key}" (${entry.requestTimestamps.length}/${config.MAX_REQUESTS_PER_HOUR}).`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            'تم تجاوز الحد الأقصى لطلبات رمز التحقق. يرجى المحاولة لاحقاً',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Records a successful OTP send. Call AFTER the OTP has actually been
   * dispatched (email / SMS).
   */
  recordRequest(key: string): void {
    const entry = this.getOrCreate(key);
    entry.requestTimestamps.push(Date.now());

    // A new OTP was issued → reset verification attempts for this key.
    entry.verifyAttempts = 0;
    entry.blocked = false;
  }

  // ─── OTP Verification Limits ──────────────────────────────────────

  /**
   * Enforces the per-OTP verification attempt cap.
   * Call BEFORE checking the OTP code.
   *
   * @throws HttpException 429 if too many attempts or blocked.
   */
  checkVerifyLimit(key: string): void {
    const entry = this.getOrCreate(key);

    if (entry.blocked) {
      this.logger.warn(
        `Blocked OTP verification attempt for key="${key}" (OTP invalidated after max failures).`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'تم تعطيل رمز التحقق بسبب محاولات كثيرة. يرجى طلب رمز جديد',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const config = getOtpRateLimitConfig();
    if (entry.verifyAttempts >= config.MAX_VERIFY_ATTEMPTS) {
      entry.blocked = true;
      this.logger.warn(
        `OTP verification attempt cap reached for key="${key}" (${entry.verifyAttempts}/${config.MAX_VERIFY_ATTEMPTS}). OTP invalidated.`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'تم تعطيل رمز التحقق بسبب محاولات كثيرة. يرجى طلب رمز جديد',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Records a verification attempt. On success the attempt counter is
   * cleared; on failure it is incremented.
   */
  recordVerifyAttempt(key: string, success: boolean): void {
    const entry = this.getOrCreate(key);

    if (success) {
      entry.verifyAttempts = 0;
      entry.blocked = false;
    } else {
      entry.verifyAttempts += 1;

      if (entry.verifyAttempts >= OTP_RATE_LIMIT.MAX_VERIFY_ATTEMPTS) {
        entry.blocked = true;
        this.logger.warn(
          `OTP for key="${key}" invalidated after ${entry.verifyAttempts} failed attempts.`,
        );
      }
    }
  }

  /**
   * Returns true when the identifier has been blocked due to too many
   * failed verification attempts. Consumers can use this to short-circuit
   * the verification logic.
   */
  isBlocked(key: string): boolean {
    return this.store.get(key)?.blocked ?? false;
  }

  // ─── Internals ────────────────────────────────────────────────────

  private getOrCreate(key: string): RateLimitEntry {
    let entry = this.store.get(key);
    if (!entry) {
      entry = { requestTimestamps: [], verifyAttempts: 0, blocked: false };
      this.store.set(key, entry);
    }
    return entry;
  }

  /** Removes entries whose last activity was >1 hour ago. */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      const lastRequest = entry.requestTimestamps.at(-1) ?? 0;
      if (now - lastRequest > ONE_HOUR_MS && entry.verifyAttempts === 0) {
        this.store.delete(key);
      }
    }
  }
}
