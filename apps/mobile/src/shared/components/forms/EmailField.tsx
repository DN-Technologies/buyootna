import type { ReactNode } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import FieldLabel from './FieldLabel';
import type { ProfileFormData } from './types';

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const DEFAULT_INPUT_CLASS =
  'border border-gray-200 rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]';// Required or optional by the sign-in method (useEditProfile checks it on
// save, since the method loads after the form). A new address is proven
// with a code (see the hint passed as children).
export default function EmailField({
  control,
  errors,
  required = false,
  children,
  labelClassName,
  inputClassName,
  showOptional = true,
}: {
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  // Set by the sign-in method; shown as "(اختياري)" when false
  required?: boolean;
  children?: ReactNode;
  // Style overrides for screens with their own input look (e.g. company)
  labelClassName?: string;
  inputClassName?: string;
  // The company edit-profile's design never shows the "(اختياري)" hint
  showOptional?: boolean;
}) {
  return (
    <View>
      <FieldLabel
        optional={showOptional && !required}
        className={labelClassName}
      >
        البريد الالكتروني
      </FieldLabel>
      <Controller
        control={control}
        name="email"
        rules={{
          validate: (value) =>
            !value?.trim() ||
            EMAIL_PATTERN.test(value.trim()) ||
            'بريد الكتروني غير صالح',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            testID="edit-profile-email"
            className={
              inputClassName ?? DEFAULT_INPUT_CLASS
            }
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="ادخل البريد الالكتروني"
            placeholderTextColor="#979797"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="right"
          />
        )}
      />
      {errors.email && (
        <Text
          className="mt-1 font-cairo-medium text-xs text-red-500"
          style={{ writingDirection: 'rtl' }}
        >
          {errors.email.message}
        </Text>
      )}
      {children}
    </View>
  );
}
