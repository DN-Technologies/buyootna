import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { OtpRateLimitGuard } from '../guards/otp-rate-limit.guard';

export const OTP_RATE_LIMIT_META = 'OTP_RATE_LIMIT_META';

export interface OtpRateLimitMeta {
  /** Whether this is an OTP-request or OTP-verify endpoint. */
  type: 'request' | 'verify';

  /**
   * How to extract the rate-limit key from the request.
   *
   * - `{ source: 'body'; field: string }` — reads `req.body[field]`.
   * - `{ source: 'user'; field: string }` — reads `req.user[field]` (JWT-authed).
   */
  key: { source: 'body'; field: string } | { source: 'user'; field: string };
}

/**
 * Apply to an OTP-request endpoint (send/re-send OTP).
 * Enforces cooldown + hourly cap based on the specified body field.
 *
 * @param bodyField - The DTO property containing the identifier (e.g. `'identifier'`, `'email'`).
 */
export function OtpRequestRateLimit(bodyField: string) {
  return applyDecorators(
    SetMetadata(OTP_RATE_LIMIT_META, {
      type: 'request',
      key: { source: 'body', field: bodyField },
    } satisfies OtpRateLimitMeta),
    UseGuards(OtpRateLimitGuard),
  );
}

/**
 * Apply to an OTP-verify endpoint.
 * Enforces max-attempt cap based on the specified body field.
 *
 * @param bodyField - The DTO property containing the identifier (e.g. `'phone'`, `'email'`).
 */
export function OtpVerifyRateLimit(bodyField: string) {
  return applyDecorators(
    SetMetadata(OTP_RATE_LIMIT_META, {
      type: 'verify',
      key: { source: 'body', field: bodyField },
    } satisfies OtpRateLimitMeta),
    UseGuards(OtpRateLimitGuard),
  );
}

/**
 * Apply to an OTP-request endpoint where the key comes from the JWT user
 * object (e.g. `req.user.phone` for change-password request-otp).
 *
 * @param userField - The property on `req.user` to use as the rate-limit key.
 */
export function OtpRequestRateLimitFromUser(userField: string) {
  return applyDecorators(
    SetMetadata(OTP_RATE_LIMIT_META, {
      type: 'request',
      key: { source: 'user', field: userField },
    } satisfies OtpRateLimitMeta),
    UseGuards(OtpRateLimitGuard),
  );
}

/**
 * Apply to an OTP-verify endpoint where the key comes from the JWT user
 * object (e.g. `req.user.userId` for change-password).
 *
 * @param userField - The property on `req.user` to use as the rate-limit key.
 */
export function OtpVerifyRateLimitFromUser(userField: string) {
  return applyDecorators(
    SetMetadata(OTP_RATE_LIMIT_META, {
      type: 'verify',
      key: { source: 'user', field: userField },
    } satisfies OtpRateLimitMeta),
    UseGuards(OtpRateLimitGuard),
  );
}
