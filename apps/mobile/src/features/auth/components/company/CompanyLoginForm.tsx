import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  CompanyLoginFormValues,
  companyLoginSchema,
} from '@/features/auth/companyAuthSchemas';
import FormInput from '@/shared/components/ui/FormInput';

interface CompanyLoginFormProps {
  onSubmit: (data: CompanyLoginFormValues) => void;
  onOpenProfiles: () => void;
  isLoading?: boolean;
}

export const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({
  onSubmit,
  onOpenProfiles,
  isLoading = false,
}) => {
  const router = useRouter();

  const { control, handleSubmit } = useForm<CompanyLoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
    mode: 'onTouched',
  });

  const handleLogin = (data: CompanyLoginFormValues) => {
    onSubmit(data);
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

      {/* هل نسيت كلمة المرور؟ on the right (start, in RTL) */}
      <View className="mb-8 w-full flex-row items-center justify-start">
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
