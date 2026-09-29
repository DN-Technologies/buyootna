import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Slows down password guessing: 5 wrong passwords per IP and role within
 * 15 minutes, then 429 until the window passes. In memory, like the OTP
 * limiter -- a restart clears it, which is acceptable for this surface.
 */
@Injectable()
export class DocsLoginLimiterService {
  private readonly failures = new Map<string, number[]>();

  private recent(key: string, now: number): number[] {
    const kept = (this.failures.get(key) ?? []).filter(
      (at) => now - at < WINDOW_MS,
    );
    if (kept.length) this.failures.set(key, kept);
    else this.failures.delete(key);
    return kept;
  }

  assertAllowed(key: string, now = Date.now()): void {
    if (this.recent(key, now).length >= MAX_FAILURES) {
      throw new HttpException(
        'محاولات كثيرة، يرجى المحاولة بعد 15 دقيقة',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(key: string, now = Date.now()): void {
    this.failures.set(key, [...this.recent(key, now), now]);
  }

  reset(key: string): void {
    this.failures.delete(key);
  }
}
