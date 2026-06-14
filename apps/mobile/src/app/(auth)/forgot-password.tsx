import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef,useState } from 'react';
import { KeyboardAvoidingView, Platform,ScrollView } from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/core/api/api';
import SuccessBottomSheet from '@/core/components/SuccessBottomSheet';
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

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [timer, setTimer] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const successSheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();

  const onStep1Submit = async (data: RequestOtpValues) => {
    try {
      await apiClient.post('/auth/recovery/request-otp', {
        identifier: data.identifier,
      });

      setIdentifier(data.identifier);
      setStep(2);
      setTimer(45);
    } catch (error) {}
  };

  const onStep2Submit = async (data: VerifyOtpValues) => {
    try {
      const response = await apiClient.post('/auth/recovery/verify-otp', {
        identifier: identifier, // Use the idenfiter saved from Step 1
        otp: data.otp,
      });

      // Save the temporary token for Step 3
      setResetToken(response.data.resetToken);
      setStep(3);
    } catch (error: any) {
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join('\n')
        : message || 'رمز التحقق غير صحيح';
      Alert.alert('خطأ', errorMsg);
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
      const message = error.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join('\n')
        : message || 'تعذر تحديث كلمة المرور';
      Alert.alert('خطأ', errorMsg);
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
