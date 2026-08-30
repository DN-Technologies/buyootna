import { HttpException, HttpStatus } from '@nestjs/common';
import { OtpRateLimiterService } from './otp-rate-limiter.service';

describe('OtpRateLimiterService', () => {
  let service: OtpRateLimiterService;

  beforeEach(() => {
    delete process.env.OTP_REQUEST_COOLDOWN_SECONDS;
    delete process.env.OTP_MAX_REQUESTS_PER_DAY;
    delete process.env.OTP_MAX_REQUESTS_PER_HOUR;
    delete process.env.OTP_MAX_VERIFY_ATTEMPTS;
    service = new OtpRateLimiterService();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('Progressive Resend Cooldowns', () => {
    it('allows the initial OTP request with 0 cooldown', () => {
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();
    });

    it('enforces progressive cooldown schedule: 30s, 60s, 120s, 240s, 300s', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      // Initial request (resendCount = 0 -> after record: resendCount = 1)
      service.checkRequestLimit('test@example.com');
      service.recordRequest('test@example.com');

      // 1st resend attempt: requires 30s delay
      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown 429 for 30s cooldown');
      } catch (err) {
        const httpError = err as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const resp = httpError.getResponse() as Record<string, unknown>;
        expect(resp.retryAfter).toBe(30);
      }

      // Fast forward 31s -> allow 1st resend
      jest.setSystemTime(now + 31 * 1000);
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();
      service.recordRequest('test@example.com'); // resendCount = 2

      // 2nd resend attempt: requires 60s delay
      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown 429 for 60s cooldown');
      } catch (err) {
        const resp = (err as HttpException).getResponse() as Record<
          string,
          unknown
        >;
        expect(resp.retryAfter).toBe(60);
      }

      // Fast forward 61s -> allow 2nd resend
      jest.setSystemTime(now + 92 * 1000);
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();
      service.recordRequest('test@example.com'); // resendCount = 3

      // 3rd resend attempt: requires 120s delay
      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown 429 for 120s cooldown');
      } catch (err) {
        const resp = (err as HttpException).getResponse() as Record<
          string,
          unknown
        >;
        expect(resp.retryAfter).toBe(120);
      }

      jest.useRealTimers();
    });

    it('resets progressive cooldown cycle after successful verification', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      service.recordRequest('test@example.com'); // 1st
      jest.setSystemTime(now + 31 * 1000);
      service.recordRequest('test@example.com'); // 2nd (resendCount = 2)

      // Successful verification
      service.recordVerifyAttempt('test@example.com', true);

      // Next request starts fresh with 0s cooldown
      jest.setSystemTime(now + 32 * 1000);
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();

      jest.useRealTimers();
    });
  });

  describe('Daily OTP Request Limit (10 per 24 hours)', () => {
    it('allows up to 10 requests within a 24-hour window', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      // Perform 10 spaced requests (each 305s apart to exceed max 300s progressive cooldown)
      for (let i = 0; i < 10; i++) {
        jest.setSystemTime(now + i * 305 * 1000);
        expect(() =>
          service.checkRequestLimit('test@example.com'),
        ).not.toThrow();
        service.recordRequest('test@example.com');
      }

      // 11th request within 24h is rejected
      jest.setSystemTime(now + 10 * 305 * 1000);
      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown 429 for 24h limit');
      } catch (err) {
        const httpError = err as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const resp = httpError.getResponse() as Record<string, unknown>;
        expect(resp.message).toContain('10 طلبات خلال 24 ساعة');
        expect(resp.retryAfter).toBeGreaterThan(0);
      }

      // Fast forward past 24 hours -> requests allowed again
      jest.setSystemTime(now + 25 * 60 * 60 * 1000);
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();

      jest.useRealTimers();
    });

    it('tracks rate limits independently for different identifiers', () => {
      service.checkRequestLimit('user1@example.com');
      service.recordRequest('user1@example.com');

      // user2 is unaffected
      expect(() =>
        service.checkRequestLimit('user2@example.com'),
      ).not.toThrow();
    });
  });

  describe('OTP Verification Attempt Limits (Max 3 Failures)', () => {
    it('allows verification attempts before 3 failures', () => {
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
      service.recordVerifyAttempt('test@example.com', false); // 1st failure
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
      service.recordVerifyAttempt('test@example.com', false); // 2nd failure
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
    });

    it('blocks and invalidates OTP after 3rd consecutive failed attempt', () => {
      service.recordVerifyAttempt('test@example.com', false); // 1
      service.recordVerifyAttempt('test@example.com', false); // 2
      service.recordVerifyAttempt('test@example.com', false); // 3

      expect(service.isBlocked('test@example.com')).toBe(true);

      // Next verify attempt throws 429
      expect(() => service.checkVerifyLimit('test@example.com')).toThrow(
        HttpException,
      );
      try {
        service.checkVerifyLimit('test@example.com');
      } catch (err) {
        const httpError = err as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const resp = httpError.getResponse() as Record<string, unknown>;
        expect(resp.message).toContain('تم تعطيل رمز التحقق');
      }
    });

    it('unblocks and resets verification attempts when a new OTP is requested', () => {
      // Fail 3 times
      service.recordVerifyAttempt('test@example.com', false);
      service.recordVerifyAttempt('test@example.com', false);
      service.recordVerifyAttempt('test@example.com', false);
      expect(service.isBlocked('test@example.com')).toBe(true);

      // New OTP issued
      service.recordRequest('test@example.com');

      expect(service.isBlocked('test@example.com')).toBe(false);
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
    });
  });
});
