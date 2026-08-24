import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { SignupFormValues, signupSchema } from '@/features/auth/authSchemas';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import FormInput from '@/shared/components/FormInput';

interface IndividualSignupFormProps {
  onSubmit: (data: SignupFormValues) => void;
  onGooglePress: () => void;
  onApplePress: () => void;
  // The regular signup submit is in flight.
  isLoading?: boolean;
  // Independent per-provider loading, so tapping one doesn't spin the other.
  isGoogleLoading?: boolean;
  isAppleLoading?: boolean;
}

export const IndividualSignupForm: React.FC<IndividualSignupFormProps> = ({
  onSubmit,
  onGooglePress,
  onApplePress,
  isLoading = false,
  isGoogleLoading = false,
  isAppleLoading = false,
}) => {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  });

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="identifier"
        label="رقم الهاتف أو البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
        testID="individual-signup-password-input"
        textContentType="newPassword"
        autoComplete="new-password"
      />

      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور"
        placeholder="**************"
        isPassword={true}
        testID="individual-signup-confirm-password-input"
        textContentType="newPassword"
        autoComplete="new-password"
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

      <SocialAuthButtons
        onGooglePress={onGooglePress}
        onApplePress={onApplePress}
        isGoogleLoading={isGoogleLoading}
        isAppleLoading={isAppleLoading}
        disabled={isLoading}
      />
    </View>
  );
};
