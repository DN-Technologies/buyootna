import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import FieldLabel from './FieldLabel';
import type { ProfileFormData } from './types';

interface KuwaitPhoneFieldProps {
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  name: 'phone' | 'whatsapp';
  label: string;
  requiredMessage: string;
  // False when the sign-in method makes this number optional ("(اختياري)")
  required?: boolean;
  // False when the screen checks "required" on save instead of in the form
  // (the phone: its requirement loads after the form, which would leave the
  // form's validity stale)
  requiredInForm?: boolean;
  // Shown under the input (e.g. the phone's verification hint)
  children?: ReactNode;
  // Style overrides for screens with their own input look (e.g. company);
  // each fully replaces its default so callers own the whole look
  labelClassName?: string;
  inputClassName?: string;
  pillClassName?: string;
  pillTextClassName?: string;
  pillIconColor?: string;
}

// A number input with the +965 country box beside it
export default function KuwaitPhoneField({
  control,
  errors,
  name,
  label,
  requiredMessage,
  required = true,
  requiredInForm = required,
  children,
  labelClassName,
  inputClassName,
  pillClassName,
  pillTextClassName,
  pillIconColor = '#111111',
}: KuwaitPhoneFieldProps) {
  return (
    <View>
      <FieldLabel optional={!required} className={labelClassName}>
        {label}
      </FieldLabel>
      <View className="flex-row gap-2">
        <Controller
          control={control}
          name={name}
          // A cleared optional number is fine; a typed one must be complete
          rules={
            requiredInForm
              ? { required: requiredMessage, minLength: 8 }
              : { minLength: 8 }
          }
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={
                inputClassName ??
                `flex-1 border ${
                  errors[name] ? 'border-red-500' : 'border-gray-200'
                } rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`
              }
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
              textAlign="right"
            />
          )}
        />
        {/* Country Code Dropdown */}
        <TouchableOpacity
          className={
            pillClassName ??
            'w-24 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3'
          }
        >
          <Text
            className={
              pillTextClassName ??
              'font-cairo-medium text-sm leading-[22px] text-[#64748B]'
            }
          >
            +965
          </Text>
          <Feather name="chevron-down" size={16} color={pillIconColor} />
        </TouchableOpacity>
      </View>
      {errors[name] && (
        <Text
          className="mt-1 font-cairo-medium text-xs text-red-500"
          style={{ writingDirection: 'rtl' }}
        >
          {requiredMessage}
        </Text>
      )}
      {children}
    </View>
  );
}
