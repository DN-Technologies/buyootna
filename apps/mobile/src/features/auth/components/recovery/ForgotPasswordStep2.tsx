import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  verifyOtpSchema,
  VerifyOtpValues,
} from '@/features/auth/recoverySchemas';
import {
  ResendOtpResult,
  useOtpResendTimer,
} from '@/shared/hooks/useOtpResendTimer';

interface ForgotPasswordStep2Props {
  identifier: string;
  onSubmit: (data: VerifyOtpValues) => Promise<boolean>;
  onResendOtp: () => Promise<ResendOtpResult>;
}

export const ForgotPasswordStep2: React.FC<ForgotPasswordStep2Props> = ({
  identifier,
  onSubmit,
  onResendOtp,
}) => {
  const router = useRouter();
  const { secondsLeft, isReady, limitReachedMessage, handleResendResult } =
    useOtpResendTimer(45);
  const otpInputRef = useRef<TextInput>(null);

  const { control, handleSubmit, watch, setValue } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onChange',
  });

  const otpValue = watch('otp');
  const isStep2Disabled = !otpValue || otpValue.trim() === '';

  const handleVerify = async (data: VerifyOtpValues) => {
    const success = await onSubmit(data);
    if (!success) {
      // Let the user retype immediately instead of having to clear the
      // stale wrong/expired code themselves first.
      setValue('otp', '');
      otpInputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    // The success alert is a native Modal, which iOS can visibly delay
    // presenting while a keyboard is still open/animating -- dismiss it
    // up front so the alert isn't competing with that by the time the
    // request resolves (the countdown timer, a plain text re-render, has
    // no such delay, which is what made the two look out of sync).
    Keyboard.dismiss();
    const result = await onResendOtp();
    handleResendResult(result);
  };

  return (
    <View className="flex-1 justify-between">
      <View>
        <View className="mb-10 mt-6 items-center">
          <Text className="mb-2 font-cairo-bold text-2xl text-charcoal">
            تحقق من الرمز
          </Text>
          <Text className="px-4 text-center font-cairo-semibold text-sm text-gray-medium">
            أرسلنا رمز التحقق المكون من 6 أرقام إلى {identifier}
          </Text>
        </View>

        {/* Custom OTP Input */}
        <Controller
          control={control}
          name="otp"
          render={({
            field: { onChange, value = '' },
            fieldState: { error },
          }) => (
            <View className="mb-6 items-center w-full">
              {/* Pressable area to focus hidden TextInput */}
              <TouchableOpacity
                testID="forgot-password-otp-boxes"
                activeOpacity={1}
                onPress={() => otpInputRef.current?.focus()}
                className="w-full flex-row justify-between"
                style={{ direction: 'ltr' }}
              >
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    className={`h-14 w-12 items-center justify-center rounded-xl border-[1.5px] bg-white ${
                      value.length === index
                        ? 'border-secondary'
                        : error
                          ? 'border-red-500'
                          : 'border-gray-300'
                    }`}
                  >
                    <Text className="font-cairo-bold text-xl text-charcoal">
                      {value[index] || ''}
                    </Text>
                  </View>
                ))}
              </TouchableOpacity>

              {/* The Hidden Actual Input */}
              <TextInput
                ref={otpInputRef}
                testID="forgot-password-otp-input"
                value={value}
                onChangeText={(text) => {
                  const clean = text.replace(/[^0-9]/g, '');
                  if (clean.length <= 6) onChange(clean);
                }}
                keyboardType="number-pad"
                maxLength={6}
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0 }}
                pointerEvents="none"
                autoFocus
              />

              {error && (
                <Text className="mt-2 font-cairo-semibold text-xs text-red-500">
                  {error.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Resend Timer */}
        <View className="mb-8 items-center">
          {limitReachedMessage ? (
            <Text className="px-4 text-center font-cairo-semibold text-sm text-red-500">
              {limitReachedMessage}
            </Text>
          ) : isReady ? (
            <TouchableOpacity activeOpacity={0.7} onPress={handleResend}>
              <Text className="font-cairo-bold text-sm text-secondary underline">
                إعادة إرسال الرمز
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="font-cairo-semibold text-sm text-gray-medium">
              إعادة إرسال الرمز خلال{' '}
              {Math.floor(secondsLeft / 60)
                .toString()
                .padStart(2, '0')}
              :{(secondsLeft % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-auto w-full">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(handleVerify)}
          disabled={isStep2Disabled}
          className={`h-[48px] w-full items-center justify-center rounded-3xl ${
            isStep2Disabled ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
          }`}
        >
          <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
            التحقق من الرمز
          </Text>
        </TouchableOpacity>

        {/* Back to Login Prompt */}
        <View className="mt-8 flex-row items-center justify-center gap-1.5 pb-2">
          <Text className="font-cairo text-[12px] text-[#6B6A6A]">
            هل تذكرت كلمة المرور ؟
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/individual-auth')}
          >
            <Text className="font-cairo-bold text-[12px] text-[#15304D]">
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
