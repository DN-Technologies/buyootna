import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { LoginFormValues, loginSchema } from '@/features/auth/authSchemas';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import { TermsAgreement } from '@/features/auth/components/TermsAgreement';
import FormInput from '@/shared/components/ui/FormInput';

interface IndividualLoginFormProps {
  onSubmit: (data: LoginFormValues & { rememberMe: boolean }) => void;
  onOpenProfiles: () => void;
  onGooglePress: () => void;
  onApplePress: () => void;
  // The regular login submit is in flight.
  isLoading?: boolean;
  // Independent per-provider loading, so tapping one doesn't spin the other.
  isGoogleLoading?: boolean;
  isAppleLoading?: boolean;
}

export const IndividualLoginForm: React.FC<IndividualLoginFormProps> = ({
  onSubmit,
  onOpenProfiles,
  onGooglePress,
  onApplePress,
  isLoading = false,
  isGoogleLoading = false,
  isAppleLoading = false,
}) => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const handleLogin = (data: LoginFormValues) => {
    onSubmit({ ...data, rememberMe });
  };

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="identifier"
        label="رقم الهاتف أو البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        autoCapitalize="none"
        testID="individual-login-identifier-input"
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
        testID="individual-login-password-input"
      />

      <View className="mb-8 w-full flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            className={`mr-2 h-5 w-5 rounded border-[1.5px] ${
              rememberMe ? 'border-primary bg-primary' : 'border-[#6B6A6A]'
            } items-center justify-center`}
          >
            {rememberMe && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="font-cairo text-[12px] text-[#6B6A6A]">تذكري</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text className="font-cairo-medium text-sm text-primary">
            هل نسيت كلمة المرور؟
          </Text>
        </TouchableOpacity>
      </View>

      <TermsAgreement />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(handleLogin)}
        disabled={isLoading}
        className={`mb-4 h-[48px] w-full items-center justify-center rounded-3xl bg-primary ${isLoading ? 'bg-primary/70' : 'bg-primary'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
            تسجيل الدخول
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenProfiles}
        className="mt-1 items-center pb-4"
      >
        <Text className="font-cairo-semibold text-base text-charcoal">
          المتابعة بحساب محفوظ
        </Text>
      </TouchableOpacity>
    </View>
  );
};
