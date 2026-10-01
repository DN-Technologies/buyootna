import { Control, Controller } from 'react-hook-form';
import { TextInput, View } from 'react-native';

import FieldLabel from './FieldLabel';
import type { ProfileFormData } from './types';

// Read-only: the email is shown, not edited here
export default function EmailField({
  control,
}: {
  control: Control<ProfileFormData>;
}) {
  return (
    <View>
      <FieldLabel>البريد الالكتروني</FieldLabel>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'البريد الالكتروني مطلوب',
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'بريد الكتروني غير صالح',
          },
        }}
        render={({ field: { value } }) => (
          <TextInput
            className="border border-gray-200 rounded-xl bg-gray-50 px-4 py-3.5 text-right font-cairo-medium text-gray-400"
            value={value}
            editable={false}
            textAlign="right"
          />
        )}
      />
    </View>
  );
}
