import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity,View } from 'react-native';

import FormInput from '@/components/FormInput';
import {
  requestOtpSchema,
  RequestOtpValues,
} from '@/features/auth/recoverySchemas';

interface ForgotPasswordStep1Props {
  onSubmit: (data: RequestOtpValues) => void;
}

export const ForgotPasswordStep1: React.FC<ForgotPasswordStep1Props> = ({
  onSubmit,
}) => {
  const { control, handleSubmit, watch } = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    mode: 'onChange',
  });

  const identifierValue = watch('identifier');
  const isStep1Disabled = !identifierValue || identifierValue.trim() === '';

  return (
    <View className="flex-1">
      <View className="mb-10 mt-1 items-center">
        <Text className="font-cairo-semibold text-2xl leading-tight tracking-normal text-charcoal">
          نسيت كلمة المرور؟
        </Text>
        <Text className="px-4 text-center font-cairo-medium text-sm leading-normal tracking-normal text-gray-medium">
          أدخل رقم الهاتف أو البريد الالكتروني المرتبط بحسابك
        </Text>
      </View>

      <FormInput
        control={control}
        name="identifier"
        label="رقم الهاتف أو البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        autoCapitalize="none"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        className={`mt-auto w-full items-center justify-center rounded-3xl py-4 ${
          isStep1Disabled ? 'bg-[#A6A6A6]' : 'bg-secondary'
        }`}
      >
        <Text className="font-cairo-bold text-lg text-white">
          إرسال رمز التحقق
        </Text>
      </TouchableOpacity>
    </View>
  );
};
