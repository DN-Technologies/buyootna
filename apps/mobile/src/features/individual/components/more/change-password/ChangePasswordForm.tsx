import { Control, Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FormInput from '@/shared/components/FormInput';

import { ChangePasswordFormValues } from './changePasswordSchema';

interface ChangePasswordFormProps {
  control: Control<ChangePasswordFormValues>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  control,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <View>
      <View className="mb-6">
        <FormInput
          control={control}
          name="oldPassword"
          label="كلمة المرور الحالية"
          isPassword
          placeholder="أدخل كلمة المرور الحالية"
          isRequired
          testID="change-password-old-input"
        />

        <FormInput
          control={control}
          name="newPassword"
          label="كلمة المرور الجديدة"
          isPassword
          placeholder="أدخل كلمة المرور الجديدة"
          isRequired
          testID="change-password-new-input"
        />

        <FormInput
          control={control}
          name="confirmPassword"
          label="تأكيد كلمة المرور"
          isPassword
          placeholder="أعد إدخال كلمة المرور الجديدة"
          isRequired
          testID="change-password-confirm-input"
        />

        {/* Logout all devices option */}
        <Controller
          control={control}
          name="logoutAllDevices"
          render={({ field: { value, onChange } }) => (
            <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-4">
              <Text className="font-cairo-medium text-[14px] text-[#111111]">
                تسجيل الخروج من جميع الأجهزة
              </Text>
              <Switch
                value={!!value}
                onValueChange={onChange}
                trackColor={{ false: '#E2E8F0', true: '#15304D' }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          )}
        />
      </View>

      {/* Action button at the bottom of form */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSubmit}
        disabled={isSubmitting}
        className="mt-6 h-14 w-full items-center justify-center rounded-full bg-[#15304D] shadow-sm"
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-bold text-base text-white">
            تحديث كلمة المرور
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordForm;
