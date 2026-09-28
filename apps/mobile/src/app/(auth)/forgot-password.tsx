import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Modular Components
import { ForgotPasswordHeader } from '@/features/auth/components/recovery/ForgotPasswordHeader';
import { ForgotPasswordStep1 } from '@/features/auth/components/recovery/ForgotPasswordStep1';
import { ForgotPasswordStep2 } from '@/features/auth/components/recovery/ForgotPasswordStep2';
import { ForgotPasswordStep3 } from '@/features/auth/components/recovery/ForgotPasswordStep3';
import {
  RequestOtpValues,
  ResetPasswordValues,
  VerifyOtpValues,
} from '@/features/auth/recoverySchemas';
import apiClient from '@/shared/api/api';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import { ResendOtpResult } from '@/shared/hooks/useOtpResendTimer';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [initialResendResult, setInitialResendResult] = useState<
    ResendOtpResult | undefined
  >(undefined);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const onStep1Submit = async (data: RequestOtpValues) => {
    try {
      await apiClient.post('/auth/recovery/request-otp', {
        identifier: data.identifier,
      });

      setIdentifier(data.identifier);
      setInitialResendResult(undefined);
      setStep(2);
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const retryAfter = error?.response?.data?.retryAfter;
      const message = getApiErrorMessage(error, 'تعذر إرسال رمز التحقق');
      // Rate-limited: a code was sent recently, so continue to the code
      // step with the countdown running (no wait-time toast)
      if (code === 'OTP_COOLDOWN' || code === 'OTP_DAILY_LIMIT') {
        setIdentifier(data.identifier);
        setInitialResendResult({ success: false, code, retryAfter, message });
        setStep(2);
        return;
      }
      showAlert('خطأ', message);
    }
  };

  const onResendOtp = async (): Promise<ResendOtpResult> => {
    try {
      await apiClient.post('/auth/recovery/request-otp', { identifier });
      return { success: true };
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const retryAfter = error?.response?.data?.retryAfter;
      const message = getApiErrorMessage(error, 'تعذر إعادة إرسال رمز التحقق');
      // Cooldown/daily-limit state is rendered inline by the OTP step
      // itself — an alert on top of that would just be redundant.
      if (code !== 'OTP_COOLDOWN' && code !== 'OTP_DAILY_LIMIT') {
        showAlert('خطأ', message);
      }
      return { success: false, code, retryAfter, message };
    }
  };

  const onStep2Submit = async (data: VerifyOtpValues): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/recovery/verify-otp', {
        identifier: identifier, // Use the idenfiter saved from Step 1
        otp: data.otp,
      });

      // Save the temporary token for Step 3
      setResetToken(response.data.resetToken);
      setStep(3);
      return true;
    } catch (error: any) {
      showAlert('خطأ', getApiErrorMessage(error, 'رمز التحقق غير صحيح'));
      return false;
    }
  };

  const onStep3Submit = async (data: ResetPasswordValues) => {
    try {
      await apiClient.post('/auth/recovery/reset-password', {
        resetToken: resetToken,
        newPassword: data.password,
      });

      // Trigger the Success Bottom Sheet!
      successSheetRef.current?.present();
    } catch (error: any) {
      showAlert('خطأ', getApiErrorMessage(error, 'تعذر تحديث كلمة المرور'));
    }
  };

  const handleSuccessClose = () => {
    successSheetRef.current?.dismiss();
    router.replace('/(auth)/individual-auth');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ForgotPasswordHeader onBack={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          {step === 1 && <ForgotPasswordStep1 onSubmit={onStep1Submit} />}
          {step === 2 && (
            <ForgotPasswordStep2
              identifier={identifier}
              onSubmit={onStep2Submit}
              onResendOtp={onResendOtp}
              initialResendResult={initialResendResult}
            />
          )}
          {step === 3 && <ForgotPasswordStep3 onSubmit={onStep3Submit} />}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم تحديث كلمة المرور بنجاح"
        description="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
        buttonText="تسجيل الدخول"
        onPress={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
