import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, TextInput } from 'react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useOtpResendTimer } from '@/shared/hooks/useOtpResendTimer';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import {
  ChangePasswordFormValues,
  changePasswordSchema,
} from './changePasswordSchema';

export function useChangePassword() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Bottom Sheet Ref & States
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const otpInputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const {
    secondsLeft,
    isReady,
    limitReachedMessage,
    handleResendResult,
    reset,
  } = useOtpResendTimer(45);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const { control, handleSubmit, getValues, reset: resetForm } =
    useForm<ChangePasswordFormValues>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        logoutAllDevices: false,
      },
    });

  // Mask Phone for display in Arabic RTL layout
  const maskedPhone = useMemo(() => {
    if (!user?.phone) return '•••• ••••';
    const phone = user.phone;
    if (phone.length > 4) {
      return phone.slice(0, phone.length - 4) + '••••';
    }
    return '••••';
  }, [user?.phone]);

  // Handle Form Submission - accounts without a phone on file have no way
  // to receive an OTP, so the old password is their sole re-auth factor and
  // we change it directly. Accounts with a phone go through the OTP sheet.
  const onSubmitForm = async () => {
    if (!user?.phone) {
      setIsSubmitting(true);
      const { oldPassword, newPassword, logoutAllDevices } = getValues();
      try {
        await settingsService.changePassword(
          oldPassword,
          newPassword,
          undefined,
          logoutAllDevices,
        );
        showAlert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
          { text: 'موافق', onPress: () => router.back() },
        ]);
      } catch (e: any) {
        showAlert(
          'خطأ',
          getApiErrorMessage(e, 'فشل تغيير كلمة المرور. يرجى المحاولة لاحقاً.'),
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsRequestingOtp(true);
    try {
      await settingsService.requestChangePasswordOtp();
      reset(45);
      setOtp('');
      setOtpError('');
      bottomSheetRef.current?.present();
    } catch (e: any) {
      showAlert(
        'خطأ',
        getApiErrorMessage(e, 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقاً.'),
      );
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    // The success alert is a native Modal, which iOS can visibly delay
    // presenting while a keyboard is still open/animating -- dismiss it
    // up front so the alert isn't competing with that by the time the
    // request resolves (the countdown timer, a plain text re-render, has
    // no such delay, which is what made the two look out of sync).
    Keyboard.dismiss();
    try {
      await settingsService.requestChangePasswordOtp();
      setOtp('');
      setOtpError('');
      handleResendResult({ success: true });
      showAlert('نجاح', 'تم إعادة إرسال رمز التحقق بنجاح');
    } catch (e: any) {
      const code = e?.response?.data?.code;
      const retryAfter = e?.response?.data?.retryAfter;
      const message = getApiErrorMessage(e, 'فشل إعادة إرسال الرمز.');
      handleResendResult({ success: false, code, retryAfter, message });
      // Cooldown/daily-limit state is rendered inline below — an alert on
      // top of that would just be redundant.
      if (code !== 'OTP_COOLDOWN' && code !== 'OTP_DAILY_LIMIT') {
        showAlert('خطأ', message);
      }
    }
  };

  // Final Code Verification & Password Change
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError('الرجاء إدخال رمز التحقق المكون من 6 أرقام كاملاً');
      return;
    }
    setOtpError('');
    setIsSubmitting(true);
    const { oldPassword, newPassword, logoutAllDevices } = getValues();
    try {
      await settingsService.changePassword(
        oldPassword,
        newPassword,
        otp,
        logoutAllDevices,
      );
      bottomSheetRef.current?.dismiss();
      showAlert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      setOtpError(
        getApiErrorMessage(e, 'رمز التحقق غير صحيح أو منتهي الصلاحية'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    control,
    handleSubmit,
    onSubmitForm,
    isRequestingOtp,
    isSubmitting,
    bottomSheetRef,
    otpInputRef,
    otp,
    setOtp,
    otpError,
    secondsLeft,
    isReady,
    limitReachedMessage,
    maskedPhone,
    handleResendOtp,
    handleVerifyOtp,
    handleBack,
    resetForm,
  };
}

export default useChangePassword;
