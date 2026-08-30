import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OtpRateLimiterService } from '../otp-rate-limiter/otp-rate-limiter.service';
import {
  OTP_RATE_LIMIT_META,
  type OtpRateLimitMeta,
} from '../decorators/otp-rate-limit.decorator';

/**
 * NestJS guard that enforces OTP rate limits based on metadata set by
 * the `@OtpRequestRateLimit` / `@OtpVerifyRateLimit` decorators.
 */
@Injectable()
export class OtpRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiter: OtpRateLimiterService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.get<OtpRateLimitMeta | undefined>(
      OTP_RATE_LIMIT_META,
      context.getHandler(),
    );

    if (!meta) {
      // No metadata → no rate limiting configured for this handler
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const key = this.extractKey(request, meta);

    if (!key) {
      // Could not extract identifier — let the request through
      // (validation will reject it downstream anyway)
      return true;
    }

    if (meta.type === 'request') {
      this.rateLimiter.checkRequestLimit(key);
    } else {
      this.rateLimiter.checkVerifyLimit(key);
    }

    return true;
  }

  private extractKey(
    request: Record<string, unknown>,
    meta: OtpRateLimitMeta,
  ): string | null {
    const source =
      meta.key.source === 'body'
        ? (request.body as Record<string, unknown> | undefined)
        : (request.user as Record<string, unknown> | undefined);

    if (!source) return null;

    const value = source[meta.key.field];
    return typeof value === 'string' && value.length > 0 ? value : null;
  }
}
