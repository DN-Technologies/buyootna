import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import FormInput from '@/shared/components/FormInput';
import { SignupFormValues, signupSchema } from '@/features/auth/authSchemas';

interface IndividualSignupFormProps {
  onSubmit: (data: SignupFormValues) => void;
  isLoading?: boolean;
}

export const IndividualSignupForm: React.FC<IndividualSignupFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  });

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="email"
        label="البريد الإلكتروني"
        placeholder="alisalem@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="phone"
        label="رقم الهاتف"
        placeholder="55123456"
        keyboardType="phone-pad"
        isRequired={false}
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        className={`mb-4 mt-6 h-[48px] w-full items-center justify-center rounded-3xl bg-primary ${isLoading ? 'bg-primary/70' : 'bg-primary'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
            إنشاء حساب
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
