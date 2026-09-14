import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  CompanyLoginFormValues,
  companyLoginSchema,
} from '@/features/auth/companyAuthSchemas';
import FormInput from '@/shared/components/FormInput';

interface CompanyLoginFormProps {
  onSubmit: (data: CompanyLoginFormValues & { rememberMe: boolean }) => void;
  onOpenProfiles: () => void;
  isLoading?: boolean;
}

export const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({
  onSubmit,
  onOpenProfiles,
  isLoading = false,
}) => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit } = useForm<CompanyLoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
    mode: 'onTouched',
  });

  const handleLogin = (data: CompanyLoginFormValues) => {
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
      />
      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <View className="mb-8 w-full flex-row items-center justify-between">
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            className={`mr-2 h-5 w-5 items-center justify-center rounded border-[1.5px] ${
              rememberMe ? 'border-primary bg-primary' : 'border-gray-400'
            }`}
          >
            {rememberMe && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="font-cairo-medium text-sm text-slate-700">
            تذكري
          </Text>
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

      <View>
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenProfiles}
          className="items-center"
        >
          <Text className="font-cairo-semibold text-base text-charcoal">
            المتابعة بحساب محفوظ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
