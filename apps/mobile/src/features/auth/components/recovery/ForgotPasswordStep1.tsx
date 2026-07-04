import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';

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
  const router = useRouter();
  const { control, handleSubmit, watch } = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    mode: 'onChange',
  });

  const identifierValue = watch('identifier');
  const isStep1Disabled = !identifierValue || identifierValue.trim() === '';

  return (
    <View className="flex-1 justify-between">
      <View>
        <View className="mb-10 mt-3 items-center">
          <Text className="font-cairo-semibold text-lg leading-tight tracking-normal text-charcoal">
            هل نسيت كلمة المرور ؟
          </Text>
          <Text className="mt-1 px-4 text-center font-cairo text-sm leading-normal tracking-normal text-[#6B6A6A]">
            أدخل رقم الهاتف أو البريد الإلكتروني المرتبط بحسابك
          </Text>
        </View>

        <FormInput
          control={control}
          name="identifier"
          label="رقم الهاتف أو البريد الالكتروني"
          placeholder="alisalem@gmail.com"
          autoCapitalize="none"
        />
      </View>

      <View className="mt-auto w-full">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(onSubmit)}
          disabled={isStep1Disabled}
          className={`h-[48px] w-full items-center justify-center rounded-3xl ${
            isStep1Disabled ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
          }`}
        >
          <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
            إرسال رمز التحقق
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
