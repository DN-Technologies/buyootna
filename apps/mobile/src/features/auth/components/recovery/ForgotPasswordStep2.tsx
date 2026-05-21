import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect,useRef, useState } from 'react';
import { Controller,useForm } from 'react-hook-form';
import { Text, TextInput,TouchableOpacity, View } from 'react-native';

import {
  verifyOtpSchema,
  VerifyOtpValues,
} from '@/features/auth/recoverySchemas';

interface ForgotPasswordStep2Props {
  identifier: string;
  onSubmit: (data: VerifyOtpValues) => void;
}

export const ForgotPasswordStep2: React.FC<ForgotPasswordStep2Props> = ({
  identifier,
  onSubmit,
}) => {
  const [timer, setTimer] = useState(45);
  const otpInputRef = useRef<TextInput>(null);

  const { control, handleSubmit, watch } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onChange',
  });

  const otpValue = watch('otp');
  const isStep2Disabled = !otpValue || otpValue.trim() === '';

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | number;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <View className="flex-1">
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
          <View className="mb-6 items-center">
            {/* The 6 visible boxes */}
            <View
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
            </View>

            {/* The Hidden Actual Input */}
            <TextInput
              ref={otpInputRef}
              value={value}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                if (clean.length <= 6) onChange(clean);
              }}
              keyboardType="number-pad"
              maxLength={6}
              className="absolute h-full w-full opacity-0"
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
        {timer > 0 ? (
          <Text className="font-cairo-semibold text-sm text-gray-medium">
            إعادة إرسال الرمز خلال 00:{timer.toString().padStart(2, '0')}
          </Text>
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={() => setTimer(45)}>
            <Text className="font-cairo-bold text-sm text-secondary underline">
              إعادة إرسال الرمز
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        className={`mt-auto w-full items-center justify-center rounded-3xl py-4 ${
          isStep2Disabled ? 'bg-[#9CA3AF]' : 'bg-secondary'
        }`}
      >
        <Text className="font-cairo-bold text-lg text-white">
          التحقق من الرمز
        </Text>
      </TouchableOpacity>
    </View>
  );
};
