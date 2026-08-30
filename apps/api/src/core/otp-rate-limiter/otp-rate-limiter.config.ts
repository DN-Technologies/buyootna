/**
 * Centralized OTP rate-limit configuration.
 *
 * Every value is overridable via an environment variable so operators can
 * tune limits without a redeploy.
 */
export function getOtpRateLimitConfig() {
  return {
    /** Minimum seconds between two OTP requests for the same identifier. */
    REQUEST_COOLDOWN_SECONDS: parseInt(
      process.env.OTP_REQUEST_COOLDOWN_SECONDS ?? '60',
      10,
    ),

    /** Maximum OTP requests allowed per identifier within a rolling hour. */
    MAX_REQUESTS_PER_HOUR: parseInt(
      process.env.OTP_MAX_REQUESTS_PER_HOUR ?? '5',
      10,
    ),

    /** Maximum failed verification attempts before the OTP is blocked. */
    MAX_VERIFY_ATTEMPTS: parseInt(
      process.env.OTP_MAX_VERIFY_ATTEMPTS ?? '5',
      10,
    ),
  };
}

export const OTP_RATE_LIMIT = {
  get REQUEST_COOLDOWN_SECONDS() {
    return getOtpRateLimitConfig().REQUEST_COOLDOWN_SECONDS;
  },
  get MAX_REQUESTS_PER_HOUR() {
    return getOtpRateLimitConfig().MAX_REQUESTS_PER_HOUR;
  },
  get MAX_VERIFY_ATTEMPTS() {
    return getOtpRateLimitConfig().MAX_VERIFY_ATTEMPTS;
  },
};
