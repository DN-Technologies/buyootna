import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  resetPasswordSchema,
  ResetPasswordValues,
} from '@/features/auth/recoverySchemas';
import FormInput from '@/shared/components/ui/FormInput';

interface ForgotPasswordStep3Props {
  onSubmit: (data: ResetPasswordValues) => void;
}

export const ForgotPasswordStep3: React.FC<ForgotPasswordStep3Props> = ({
  onSubmit,
}) => {
  const { control, handleSubmit, watch } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const isStep3Disabled = !passwordValue || passwordValue.trim() === '';

  return (
    <View className="flex-1">
      <View className="mb-10 mt-6 items-center">
        <Text className="mb-2 font-cairo-bold text-2xl text-charcoal">
          إنشاء كلمة مرور جديدة
        </Text>
      </View>

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
        testID="forgot-password-new-password-input"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور"
        placeholder="**************"
        isPassword={true}
        testID="forgot-password-confirm-password-input"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        className={`mt-auto w-full items-center justify-center rounded-3xl py-4 ${
          isStep3Disabled ? 'bg-[#9CA3AF]' : 'bg-secondary'
        }`}
      >
        <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
          تحديث كلمة المرور
        </Text>
      </TouchableOpacity>
    </View>
  );
};
