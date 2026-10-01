import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useOtpResendTimer } from '@/shared/hooks/useOtpResendTimer';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

// Last 8 digits: "+96599998888", "96599998888" and "99998888" are one number
export function localPhone(phone?: string | null): string {
  return (phone ?? '').replace(/\D/g, '').slice(-8);
}

/**
 * Proving a phone number with an SMS code before it becomes the account's
 * phone (the API refuses a phone change any other way). start() sends the
 * code and opens the code sheet; the right code calls onVerified.
 */
export function usePhoneVerification(onVerified: (phone: string) => void) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const otpInputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [otp, setOtpState] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timer = useOtpResendTimer(45);

  const setOtp = (digits: string) => {
    setOtpState(digits);
    setOtpError('');
  };

  /** Sends the code to `number`; true when the sheet opened. */
  const start = async (number: string): Promise<boolean> => {
    try {
      const sent = await settingsService.requestPhoneOtp(number);
      setPhone(number);
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
      await settingsService.requestPhoneOtp(phone);
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
      await settingsService.verifyPhone(phone, otp);
      sheetRef.current?.dismiss();
      onVerified(phone);
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
