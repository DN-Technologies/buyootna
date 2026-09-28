import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import {
  type DeactivateStep,
  OTHER_REASON_ID,
  OTP_LENGTH,
  RESEND_SECONDS,
} from './constants';

interface UseDeactivateAccountFlowParams {
  // Dismisses the bottom sheet
  dismiss: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * State and actions for the three-step deactivation sheet: intro, reasons,
 * then the code check and the actual deactivation (logs out and returns to
 * the sign-in screen).
 */
export function useDeactivateAccountFlow({
  dismiss,
  onSuccess,
  onCancel,
}: UseDeactivateAccountFlowParams) {
  const router = useRouter();

  const [step, setStep] = useState<DeactivateStep>('intro');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [otp, setOtpState] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Where the code was sent, masked by the server ("+965 •••• 88" / email)
  const [destination, setDestination] = useState<string | null>(null);

  const otpInputRef = useRef<TextInput>(null);

  // Resend countdown, only while the code step is showing
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Back to a clean first step whenever the sheet closes
  const reset = useCallback(() => {
    setStep('intro');
    setSelectedReasons([]);
    setOtherReasonText('');
    setOtpState('');
    setCountdown(RESEND_SECONDS);
    setIsLoading(false);
    setErrorMessage(null);
    setDestination(null);
    onCancel?.();
  }, [onCancel]);

  // Sends (or resends) the code. A server-side wait (sent too recently)
  // restarts the countdown with the real remaining time instead of erroring.
  const requestCode = async () => {
    setErrorMessage(null);
    try {
      const { destination: sentTo } = await settingsService.requestSuspendOtp();
      setDestination(sentTo);
      setCountdown(RESEND_SECONDS);
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.code === 'OTP_COOLDOWN' && typeof data.retryAfter === 'number') {
        setCountdown(data.retryAfter);
        return;
      }
      setCountdown(0);
      setErrorMessage(getApiErrorMessage(error, 'تعذر إرسال رمز التحقق'));
    }
  };

  const cancel = () => {
    dismiss();
    reset();
  };

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const goToOtp = () => {
    setStep('otp');
    setOtpState('');
    void requestCode();
  };

  const setOtp = (digits: string) => {
    setOtpState(digits);
    setErrorMessage(null);
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    setOtpState('');
    otpInputRef.current?.focus();
    void requestCode();
  };

  const confirm = async () => {
    if (otp.length < OTP_LENGTH || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await settingsService.suspendAccount({
        otp,
        reasons: selectedReasons,
        ...(selectedReasons.includes(OTHER_REASON_ID) && otherReasonText.trim()
          ? { note: otherReasonText.trim() }
          : {}),
      });
      await useAuthStore.getState().logout();
      dismiss();
      onSuccess?.();
      router.replace('/(auth)/individual-auth');
    } catch (error) {
      console.error('Failed to deactivate account:', error);
      // A wrong/expired code: let them retype straight away
      setOtpState('');
      setErrorMessage(getApiErrorMessage(error, 'حدث خطأ أثناء تعطيل الحساب'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    goToIntro: () => setStep('intro'),
    goToReasons: () => setStep('reasons'),
    goToOtp,
    selectedReasons,
    hasOtherReason: selectedReasons.includes(OTHER_REASON_ID),
    toggleReason,
    otherReasonText,
    setOtherReasonText,
    otp,
    setOtp,
    otpInputRef,
    destination,
    countdown,
    resendOtp,
    isLoading,
    errorMessage,
    confirm,
    cancel,
    reset,
  };
}
