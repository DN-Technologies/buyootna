import { HttpException, HttpStatus } from '@nestjs/common';
import { OtpRateLimiterService } from './otp-rate-limiter.service';
import { OTP_RATE_LIMIT } from './otp-rate-limiter.config';

describe('OtpRateLimiterService', () => {
  let service: OtpRateLimiterService;

  beforeEach(() => {
    service = new OtpRateLimiterService();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('OTP Request Rate Limits', () => {
    it('allows the first OTP request for an identifier', () => {
      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();
    });

    it('enforces the 60-second cooldown between consecutive requests', () => {
      service.checkRequestLimit('test@example.com');
      service.recordRequest('test@example.com');

      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown HttpException 429');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const httpError = error as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const response = httpError.getResponse() as Record<string, unknown>;
        expect(response.message).toContain('يرجى الانتظار');
      }
    });

    it('allows a new request after the cooldown period has elapsed', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      service.checkRequestLimit('test@example.com');
      service.recordRequest('test@example.com');

      // Fast forward 61 seconds (past the 60s cooldown)
      jest.setSystemTime(now + 61 * 1000);

      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();

      jest.useRealTimers();
    });

    it('enforces the hourly request cap (max 5 requests per hour)', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      // Perform 5 allowed requests, each spaced out by 65 seconds
      for (let i = 0; i < OTP_RATE_LIMIT.MAX_REQUESTS_PER_HOUR; i++) {
        jest.setSystemTime(now + i * 65 * 1000);
        expect(() =>
          service.checkRequestLimit('test@example.com'),
        ).not.toThrow();
        service.recordRequest('test@example.com');
      }

      // 6th request within the same hour should be rejected
      jest.setSystemTime(
        now + OTP_RATE_LIMIT.MAX_REQUESTS_PER_HOUR * 65 * 1000,
      );
      try {
        service.checkRequestLimit('test@example.com');
        fail('Should have thrown HttpException 429 for hourly cap');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const httpError = error as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const response = httpError.getResponse() as Record<string, unknown>;
        expect(response.message).toContain('تم تجاوز الحد الأقصى');
      }

      jest.useRealTimers();
    });

    it('resets hourly request count after 1 hour has elapsed', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      for (let i = 0; i < OTP_RATE_LIMIT.MAX_REQUESTS_PER_HOUR; i++) {
        jest.setSystemTime(now + i * 65 * 1000);
        service.recordRequest('test@example.com');
      }

      // Fast forward past 1 hour (3601 seconds)
      jest.setSystemTime(now + 3601 * 1000);

      expect(() => service.checkRequestLimit('test@example.com')).not.toThrow();

      jest.useRealTimers();
    });

    it('tracks rate limits independently for different identifiers', () => {
      service.checkRequestLimit('user1@example.com');
      service.recordRequest('user1@example.com');

      // user2 should not be affected by user1's request
      expect(() =>
        service.checkRequestLimit('user2@example.com'),
      ).not.toThrow();
    });
  });

  describe('OTP Verification Attempt Limits', () => {
    it('allows verification attempts up to the limit', () => {
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
    });

    it('blocks verification after maximum failed attempts', () => {
      for (let i = 0; i < OTP_RATE_LIMIT.MAX_VERIFY_ATTEMPTS; i++) {
        expect(() =>
          service.checkVerifyLimit('test@example.com'),
        ).not.toThrow();
        service.recordVerifyAttempt('test@example.com', false);
      }

      expect(service.isBlocked('test@example.com')).toBe(true);

      // Subsequent attempt check throws 429
      expect(() => service.checkVerifyLimit('test@example.com')).toThrow(
        HttpException,
      );
      try {
        service.checkVerifyLimit('test@example.com');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        const response = httpError.getResponse() as Record<string, unknown>;
        expect(response.message).toContain('تم تعطيل رمز التحقق');
      }
    });

    it('resets verification attempts upon successful verification', () => {
      // 3 failed attempts
      service.recordVerifyAttempt('test@example.com', false);
      service.recordVerifyAttempt('test@example.com', false);
      service.recordVerifyAttempt('test@example.com', false);

      // Successful attempt resets counter
      service.recordVerifyAttempt('test@example.com', true);

      expect(service.isBlocked('test@example.com')).toBe(false);
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
    });

    it('unblocks and resets verification attempts when a new OTP is requested', () => {
      // Fail until blocked
      for (let i = 0; i < OTP_RATE_LIMIT.MAX_VERIFY_ATTEMPTS; i++) {
        service.recordVerifyAttempt('test@example.com', false);
      }
      expect(service.isBlocked('test@example.com')).toBe(true);

      // New OTP issued
      service.recordRequest('test@example.com');

      expect(service.isBlocked('test@example.com')).toBe(false);
      expect(() => service.checkVerifyLimit('test@example.com')).not.toThrow();
    });
  });
});
