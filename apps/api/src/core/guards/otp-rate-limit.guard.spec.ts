import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OtpRateLimitGuard } from './otp-rate-limit.guard';
import { OtpRateLimiterService } from '../otp-rate-limiter/otp-rate-limiter.service';
import {
  OTP_RATE_LIMIT_META,
  type OtpRateLimitMeta,
} from '../decorators/otp-rate-limit.decorator';

describe('OtpRateLimitGuard', () => {
  let guard: OtpRateLimitGuard;
  let reflector: { get: jest.Mock };
  let rateLimiter: {
    checkRequestLimit: jest.Mock;
    checkVerifyLimit: jest.Mock;
  };

  const createMockContext = (req: Record<string, unknown>): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    rateLimiter = {
      checkRequestLimit: jest.fn(),
      checkVerifyLimit: jest.fn(),
    };
    guard = new OtpRateLimitGuard(
      reflector as unknown as Reflector,
      rateLimiter as unknown as OtpRateLimiterService,
    );
  });

  it('allows access when no rate limit metadata is present on the route', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createMockContext({});

    expect(guard.canActivate(context)).toBe(true);
    expect(rateLimiter.checkRequestLimit).not.toHaveBeenCalled();
    expect(rateLimiter.checkVerifyLimit).not.toHaveBeenCalled();
  });

  it('allows access when key cannot be extracted from the request payload', () => {
    const meta: OtpRateLimitMeta = {
      type: 'request',
      key: { source: 'body', field: 'identifier' },
    };
    reflector.get.mockReturnValue(meta);
    const context = createMockContext({ body: {} });

    expect(guard.canActivate(context)).toBe(true);
    expect(rateLimiter.checkRequestLimit).not.toHaveBeenCalled();
  });

  it('extracts key from request body and checks request limits for request-type endpoints', () => {
    const meta: OtpRateLimitMeta = {
      type: 'request',
      key: { source: 'body', field: 'identifier' },
    };
    reflector.get.mockReturnValue(meta);
    const context = createMockContext({
      body: { identifier: 'ali@example.com' },
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(rateLimiter.checkRequestLimit).toHaveBeenCalledWith(
      'ali@example.com',
    );
    expect(rateLimiter.checkVerifyLimit).not.toHaveBeenCalled();
  });

  it('extracts key from request body and checks verify limits for verify-type endpoints', () => {
    const meta: OtpRateLimitMeta = {
      type: 'verify',
      key: { source: 'body', field: 'phone' },
    };
    reflector.get.mockReturnValue(meta);
    const context = createMockContext({
      body: { phone: '+96555123456', otp: '123456' },
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(rateLimiter.checkVerifyLimit).toHaveBeenCalledWith('+96555123456');
    expect(rateLimiter.checkRequestLimit).not.toHaveBeenCalled();
  });

  it('extracts key from authenticated user object for user-scoped endpoints', () => {
    const meta: OtpRateLimitMeta = {
      type: 'request',
      key: { source: 'user', field: 'userId' },
    };
    reflector.get.mockReturnValue(meta);
    const context = createMockContext({
      user: { userId: 'user-123', phone: '+96555123456' },
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(rateLimiter.checkRequestLimit).toHaveBeenCalledWith('user-123');
  });

  it('propagates 429 HttpException when rateLimiter rejects a request', () => {
    const meta: OtpRateLimitMeta = {
      type: 'request',
      key: { source: 'body', field: 'identifier' },
    };
    reflector.get.mockReturnValue(meta);
    rateLimiter.checkRequestLimit.mockImplementation(() => {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    });
    const context = createMockContext({
      body: { identifier: 'spammer@example.com' },
    });

    expect(() => guard.canActivate(context)).toThrow(HttpException);
  });
});
