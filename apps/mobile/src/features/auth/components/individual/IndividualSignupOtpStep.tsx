import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { isEmailIdentifier } from '@/features/auth/authSchemas';
import {
  verifyOtpSchema,
  VerifyOtpValues,
} from '@/features/auth/recoverySchemas';
import {
  ResendOtpResult,
  useOtpResendTimer,
} from '@/shared/hooks/useOtpResendTimer';

interface IndividualSignupOtpStepProps {
  identifier: string;
  onSubmit: (otp: string) => void;
  onResendOtp: () => Promise<ResendOtpResult>;
  isLoading?: boolean;
}

const maskPhoneNumber = (phone: string) => {
  if (!phone) return '';
  let clean = phone.trim();
  let prefix = '';
  if (clean.startsWith('+')) {
    prefix = clean.slice(0, 4) + ' ';
    clean = clean.slice(4);
  } else if (clean.startsWith('965') && clean.length > 8) {
    prefix = '+965 ';
    clean = clean.slice(3);
  }

  if (clean.length <= 4) {
    return `${prefix}•••• ${clean}`;
  }
  const last4 = clean.slice(-4);
  return `${prefix}•••• ${last4}`;
};

const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}•••@${domain}`;
};

const maskIdentifier = (identifier: string) =>
  isEmailIdentifier(identifier)
    ? maskEmail(identifier)
    : maskPhoneNumber(identifier);

export const IndividualSignupOtpStep: React.FC<IndividualSignupOtpStepProps> = ({
  identifier,
  onSubmit,
  onResendOtp,
  isLoading = false,
}) => {
  const { secondsLeft, isReady, limitReachedMessage, handleResendResult } =
    useOtpResendTimer(45);
  const otpInputRef = useRef<TextInput>(null);

  const { control, handleSubmit, watch } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onChange',
  });

  const otpValue = watch('otp');
  const isOtpDisabled = !otpValue || otpValue.trim().length < 6 || isLoading;

  const handleVerify = (data: VerifyOtpValues) => {
    onSubmit(data.otp);
  };

  const handleResend = async () => {
    const result = await onResendOtp();
    handleResendResult(result);
  };

  return (
    <View className="flex-1 justify-between mt-4">
      <View>
        <View className="mb-10 items-center">
          <Text className="mb-2 font-cairo-bold text-2xl text-charcoal">
            تحقق من الرمز
          </Text>
          <Text className="px-4 text-center font-cairo-semibold text-sm text-gray-medium">
            أرسلنا رمز التحقق المكون من 6 أرقام إلى {maskIdentifier(identifier)}
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
                testID="individual-signup-otp-boxes"
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
                        ? 'border-[#B28648]'
                        : error
                          ? 'border-red-500'
                          : 'border-gray-300'
                    }`}
                  >
                    <Text className="font-cairo-bold text-xl text-[#111111]">
                      {value[index] || ''}
                    </Text>
                  </View>
                ))}
              </TouchableOpacity>

              {/* The Hidden Actual Input */}
              <TextInput
                ref={otpInputRef}
                testID="individual-signup-otp-input"
                value={value}
                onChangeText={(text) => {
                  const clean = text.replace(/[^0-9]/g, '');
                  if (clean.length <= 6) onChange(clean);
                  // Dismiss once all 6 digits are in — otherwise the
                  // keyboard stays up with no "done" key on a number pad,
                  // leaving the submit button permanently covered/pushed up
                  // by KeyboardAvoidingView until the user taps elsewhere.
                  if (clean.length === 6) Keyboard.dismiss();
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
              <Text className="font-cairo-bold text-sm text-[#15304D] underline">
                إعادة إرسال الرمز
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="font-cairo-semibold text-sm text-[#A6A6A6]">
              إعادة إرسال الرمز خلال{' '}
              {Math.floor(secondsLeft / 60)
                .toString()
                .padStart(2, '0')}
              :{(secondsLeft % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
      </View>

      <View className="w-full pb-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(handleVerify)}
          disabled={isOtpDisabled}
          className={`h-[48px] w-full items-center justify-center rounded-3xl ${
            isOtpDisabled ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
          }`}
        >
          <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
            التحقق من الرمز
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
