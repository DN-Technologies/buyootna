import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { getOtpRateLimitConfig } from './otp-rate-limiter.config';

interface RateLimitEntry {
  /** Timestamps (ms) of OTP-request calls within the rolling 24-hour window. */
  requestTimestamps: number[];
  /** Count of failed verification attempts for the CURRENT OTP (max 3). */
  verifyAttempts: number;
  /** Current resend sequence count for progressive cooldown calculation. */
  resendCount: number;
  /** When true, all further verify calls for this OTP are rejected until a new OTP is requested. */
  blocked: boolean;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * In-memory OTP rate limiter.
 *
 * Enforces:
 * 1. Daily OTP request limit: max 10 requests / 24-hour rolling window.
 * 2. Progressive resend cooldowns: [30s, 60s, 120s, 240s, 300s].
 * 3. Max 3 verification failures per OTP before immediate invalidation.
 * 4. Successful verification cycle resets.
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

  // ─── Progressive Cooldown Calculation ──────────────────────────────

  /**
   * Calculates the required cooldown in seconds before the next OTP request
   * based on the current resend count.
   */
  getRequiredCooldown(resendCount: number): number {
    const config = getOtpRateLimitConfig();

    if (config.REQUEST_COOLDOWN_SECONDS !== null) {
      return Math.max(0, config.REQUEST_COOLDOWN_SECONDS);
    }

    if (resendCount <= 0) {
      return 0;
    }

    const schedule = config.PROGRESSIVE_COOLDOWNS;
    const index = Math.min(resendCount - 1, schedule.length - 1);
    return schedule[index];
  }

  // ─── OTP Request Limits ────────────────────────────────────────────

  /**
   * Enforces the progressive cooldown and 24-hour daily cap before a new OTP is sent.
   * Call this BEFORE actually generating / sending the OTP.
   *
   * @throws HttpException 429 if the limit or cooldown is violated.
   */
  checkRequestLimit(key: string): void {
    const entry = this.getOrCreate(key);
    const now = Date.now();
    const config = getOtpRateLimitConfig();

    // Prune timestamps older than 24 hours
    entry.requestTimestamps = entry.requestTimestamps.filter(
      (ts) => now - ts < ONE_DAY_MS,
    );

    // 1. Progressive cooldown check
    const cooldownSeconds = this.getRequiredCooldown(entry.resendCount);
    const last = entry.requestTimestamps.at(-1);

    if (
      cooldownSeconds > 0 &&
      last !== undefined &&
      now - last < cooldownSeconds * 1000
    ) {
      const retryAfter = Math.ceil(
        (cooldownSeconds * 1000 - (now - last)) / 1000,
      );
      this.logger.warn(
        `OTP request cooldown hit for key="${key}". Must wait ${retryAfter}s (resendCount=${entry.resendCount}).`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `يرجى الانتظار ${retryAfter} ثانية قبل طلب رمز تحقق جديد`,
          code: 'OTP_COOLDOWN',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Daily cap check (10 requests per 24 hours)
    if (entry.requestTimestamps.length >= config.MAX_REQUESTS_PER_DAY) {
      const oldest = entry.requestTimestamps[0] ?? now;
      const retryAfter = Math.max(
        1,
        Math.ceil((ONE_DAY_MS - (now - oldest)) / 1000),
      );
      this.logger.warn(
        `OTP 24-hour request cap reached for key="${key}" (${entry.requestTimestamps.length}/${config.MAX_REQUESTS_PER_DAY}).`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `تم تجاوز الحد الأقصى لطلبات رمز التحقق (${config.MAX_REQUESTS_PER_DAY} طلبات خلال 24 ساعة). يرجى المحاولة لاحقاً`,
          code: 'OTP_DAILY_LIMIT',
          retryAfter,
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
    entry.resendCount += 1;

    // A new OTP was issued → reset verification attempts and unblock for the new code.
    entry.verifyAttempts = 0;
    entry.blocked = false;
  }

  // ─── OTP Verification Limits ──────────────────────────────────────

  /**
   * Enforces the per-OTP verification attempt cap (max 3 failures).
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
   * Records a verification attempt.
   * On success: clears attempts, unblocks, and resets the progressive cooldown cycle.
   * On failure: increments attempts, and invalidates/blocks if max attempts (3) reached.
   */
  recordVerifyAttempt(key: string, success: boolean): void {
    const entry = this.getOrCreate(key);
    const config = getOtpRateLimitConfig();

    if (success) {
      entry.verifyAttempts = 0;
      entry.blocked = false;
      entry.resendCount = 0;
    } else {
      entry.verifyAttempts += 1;

      if (entry.verifyAttempts >= config.MAX_VERIFY_ATTEMPTS) {
        entry.blocked = true;
        this.logger.warn(
          `OTP for key="${key}" invalidated after ${entry.verifyAttempts} failed attempts.`,
        );
      }
    }
  }

  /**
   * Returns true when the identifier has been blocked due to too many
   * failed verification attempts.
   */
  isBlocked(key: string): boolean {
    return this.store.get(key)?.blocked ?? false;
  }

  /**
   * The limiter's live entries whose key contains `query` (an email, phone,
   * or user id), for the testing portal's «فك القفل». Read-only.
   */
  entries(query = '', limit = 50) {
    const now = Date.now();
    const config = getOtpRateLimitConfig();
    const q = query.trim().toLowerCase();
    return [...this.store.entries()]
      .filter(([key]) => !q || key.toLowerCase().includes(q))
      .slice(0, limit)
      .map(([key, entry]) => {
        const recent = entry.requestTimestamps.filter(
          (ts) => now - ts < ONE_DAY_MS,
        );
        const last = recent.at(-1);
        const cooldownMs = this.getRequiredCooldown(entry.resendCount) * 1000;
        const waitUntil =
          last !== undefined && now - last < cooldownMs
            ? new Date(last + cooldownMs).toISOString()
            : null;
        return {
          key,
          requestsToday: recent.length,
          dailyLimit: config.MAX_REQUESTS_PER_DAY,
          dailyLimitReached: recent.length >= config.MAX_REQUESTS_PER_DAY,
          waitUntil,
          failedAttempts: entry.verifyAttempts,
          blocked: entry.blocked,
        };
      });
  }

  /**
   * Resets all rate limit tracking for an identifier (e.g. on account deletion / full reset).
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  // ─── Internals ────────────────────────────────────────────────────

  private getOrCreate(key: string): RateLimitEntry {
    let entry = this.store.get(key);
    if (!entry) {
      entry = {
        requestTimestamps: [],
        verifyAttempts: 0,
        resendCount: 0,
        blocked: false,
      };
      this.store.set(key, entry);
    }
    return entry;
  }

  /** Removes entries whose last activity was >24 hours ago. */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      const lastRequest = entry.requestTimestamps.at(-1) ?? 0;
      if (now - lastRequest > ONE_DAY_MS && entry.verifyAttempts === 0) {
        this.store.delete(key);
      }
    }
  }
}
