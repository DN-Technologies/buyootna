import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import { NAME_REGEX, NAME_REGEX_MESSAGE } from '@/shared/utils/nameValidation';

import FieldLabel from './FieldLabel';
import type { ProfileFormData } from './types';

export default function NameField({
  control,
  errors,
}: {
  control: Control<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
}) {
  return (
    <View>
      <FieldLabel>الاسم</FieldLabel>
      <Controller
        control={control}
        name="name"
        rules={{
          required: 'الاسم مطلوب',
          maxLength: {
            value: 32,
            message: 'الاسم يجب ألا يتجاوز 32 حرفاً',
          },
          pattern: {
            value: NAME_REGEX,
            message: NAME_REGEX_MESSAGE,
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="أدخل اسمك"
            textAlign="right"
            maxLength={32}
          />
        )}
      />
      {errors.name && (
        <Text
          className="mt-1 font-cairo-medium text-xs text-red-500"
          style={{ writingDirection: 'rtl' }}
        >
          {errors.name.message}
        </Text>
      )}
    </View>
  );
}
