import { useEffect, useRef, useState } from 'react';

/** Mirrors the backend's OTP_RATE_LIMIT.PROGRESSIVE_COOLDOWNS schedule. */
const PROGRESSIVE_COOLDOWNS_SECONDS = [30, 60, 120, 240, 300];

export type ResendOtpResult =
  | { success: true }
  | {
      success: false;
      code?: 'OTP_COOLDOWN' | 'OTP_DAILY_LIMIT';
      retryAfter?: number;
      message: string;
    };

/**
 * Drives an OTP "resend" countdown that actually reflects the backend's
 * progressive cooldown (30s, 60s, 120s, 240s, 300s) and locks out entirely
 * once the daily request cap is hit -- instead of a component-local timer
 * that resets to the same fixed duration regardless of what the server
 * allows or rejects.
 */
export function useOtpResendTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(
    null,
  );
  const resendCountRef = useRef(0);

  useEffect(() => {
    if (limitReachedMessage || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, limitReachedMessage]);

  /** Feed the result of an onResendOtp() call into the timer/lock state. */
  const handleResendResult = (result: ResendOtpResult) => {
    if (result.success) {
      resendCountRef.current += 1;
      const index = Math.min(
        resendCountRef.current - 1,
        PROGRESSIVE_COOLDOWNS_SECONDS.length - 1,
      );
      setSecondsLeft(PROGRESSIVE_COOLDOWNS_SECONDS[index]);
      return;
    }

    if (result.code === 'OTP_DAILY_LIMIT') {
      setLimitReachedMessage(result.message);
      return;
    }

    if (result.code === 'OTP_COOLDOWN' && result.retryAfter) {
      // The client's local resend count drifted from the server's (e.g. a
      // previous request never reached the server) -- resync to the real
      // remaining cooldown instead of leaving the resend button active.
      setSecondsLeft(result.retryAfter);
      return;
    }

    // Any other failure (network, validation, ...): leave the button ready
    // so the user can simply try again.
  };

  /**
   * Restarts the countdown from scratch (e.g. a fresh OTP was just sent,
   * as opposed to a "resend" of the same flow) -- clears any daily-limit
   * lock and resets the progressive-cooldown sequence back to the start.
   */
  const reset = (seconds: number) => {
    resendCountRef.current = 0;
    setLimitReachedMessage(null);
    setSecondsLeft(seconds);
  };

  return {
    secondsLeft,
    isReady: !limitReachedMessage && secondsLeft <= 0,
    limitReachedMessage,
    handleResendResult,
    reset,
  };
}
