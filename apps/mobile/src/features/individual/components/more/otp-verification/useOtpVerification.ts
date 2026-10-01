import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { useOtpResendTimer } from '@/shared/hooks/useOtpResendTimer';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

interface OtpVerificationApi {
  // Sends a code to `target`; returns where it went, as shown to the user
  request: (target: string) => Promise<{ destination: string }>;
  // Checks the code; on success `target` is now on the account
  verify: (target: string, otp: string) => Promise<unknown>;
}

/**
 * Proving a new sign-in identifier (phone or email) with a 6-digit code
 * before it lands on the account. start() sends the code and opens the code
 * sheet; the right code calls onVerified.
 */
export function useOtpVerification(
  api: OtpVerificationApi,
  onVerified: (target: string) => void,
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const otpInputRef = useRef<TextInput>(null);
  const [target, setTarget] = useState('');
  const [destination, setDestination] = useState('');
  const [otp, setOtpState] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timer = useOtpResendTimer(45);

  const setOtp = (digits: string) => {
    setOtpState(digits);
    setOtpError('');
  };

  /** Sends the code to `value`; true when the sheet opened. */
  const start = async (value: string): Promise<boolean> => {
    try {
      const sent = await api.request(value);
      setTarget(value);
      setDestination(sent.destination);
      setOtp('');
      timer.reset(45);
      sheetRef.current?.present();
      // After the sheet's entrance, so the keyboard doesn't fight it
      setTimeout(() => otpInputRef.current?.focus(), 600);
      return true;
    } catch (e) {
      showAlert('خطأ', getApiErrorMessage(e, 'فشل إرسال رمز التحقق.'));
      return false;
    }
  };

  const resend = async () => {
    Keyboard.dismiss();
    try {
      await api.request(target);
      setOtp('');
      timer.handleResendResult({ success: true });
    } catch (e: any) {
      const code = e?.response?.data?.code;
      const message = getApiErrorMessage(e, 'فشل إعادة إرسال الرمز.');
      timer.handleResendResult({
        success: false,
        code,
        retryAfter: e?.response?.data?.retryAfter,
        message,
      });
      if (code !== 'OTP_COOLDOWN' && code !== 'OTP_DAILY_LIMIT') {
        showAlert('خطأ', message);
      }
    }
  };

  const verify = async () => {
    if (otp.length < 6 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.verify(target, otp);
      sheetRef.current?.dismiss();
      onVerified(target);
    } catch (e) {
      setOtpError(
        getApiErrorMessage(e, 'رمز التحقق غير صحيح أو منتهي الصلاحية'),
      );
      // Let them retype straight away
      setOtpState('');
      otpInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sheetRef,
    otpInputRef,
    destination,
    otp,
    setOtp,
    otpError,
    isSubmitting,
    secondsLeft: timer.secondsLeft,
    isReady: timer.isReady,
    limitReachedMessage: timer.limitReachedMessage,
    start,
    resend,
    verify,
  };
}
