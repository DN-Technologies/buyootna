/**
 * Centralized OTP rate-limit configuration.
 *
 * Every value is overridable via an environment variable so operators can
 * tune limits without a redeploy.
 */
export function getOtpRateLimitConfig() {
  return {
    /** Default TTL / validity duration of an OTP in minutes. Default: 3 minutes. */
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES ?? '3', 10),

    /**
     * Cooldown override in seconds (if explicitly configured).
     * When <= 0, cooldown is bypassed entirely (e.g. in test env).
     */
    REQUEST_COOLDOWN_SECONDS:
      process.env.OTP_REQUEST_COOLDOWN_SECONDS !== undefined
        ? parseInt(process.env.OTP_REQUEST_COOLDOWN_SECONDS, 10)
        : null,

    /** Progressive resend delays in seconds: [30s, 60s, 120s, 240s, 300s]. */
    PROGRESSIVE_COOLDOWNS: [30, 60, 120, 240, 300],

    /** Maximum OTP requests allowed per identifier within a rolling 24-hour window. */
    MAX_REQUESTS_PER_DAY: parseInt(
      process.env.OTP_MAX_REQUESTS_PER_DAY ??
        process.env.OTP_MAX_REQUESTS_PER_HOUR ??
        '10',
      10,
    ),

    /** Maximum failed verification attempts before the OTP is invalidated/blocked. Default: 3. */
    MAX_VERIFY_ATTEMPTS: parseInt(
      process.env.OTP_MAX_VERIFY_ATTEMPTS ?? '3',
      10,
    ),
  };
}

export const OTP_RATE_LIMIT = {
  get OTP_EXPIRY_MINUTES() {
    return getOtpRateLimitConfig().OTP_EXPIRY_MINUTES;
  },
  get REQUEST_COOLDOWN_SECONDS() {
    return getOtpRateLimitConfig().REQUEST_COOLDOWN_SECONDS;
  },
  get PROGRESSIVE_COOLDOWNS() {
    return getOtpRateLimitConfig().PROGRESSIVE_COOLDOWNS;
  },
  get MAX_REQUESTS_PER_DAY() {
    return getOtpRateLimitConfig().MAX_REQUESTS_PER_DAY;
  },
  get MAX_REQUESTS_PER_HOUR() {
    return getOtpRateLimitConfig().MAX_REQUESTS_PER_DAY;
  },
  get MAX_VERIFY_ATTEMPTS() {
    return getOtpRateLimitConfig().MAX_VERIFY_ATTEMPTS;
  },
};
