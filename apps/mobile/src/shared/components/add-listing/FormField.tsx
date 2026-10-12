import type { ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

// The add-ad form's input box (Figma NewInput: 46px, 6px radius)
export const INPUT_BOX_CLASS =
  'h-[46px] w-full flex-row items-center rounded-md border border-[#ECECEC] bg-white px-3';
export const INPUT_TEXT_CLASS = 'flex-1 text-right font-cairo text-[14px] text-[#111111]';
export const PLACEHOLDER_COLOR = '#979797';

interface FieldLabelProps {
  label: string;
  required?: boolean;
}

export function FieldLabel({ label, required }: FieldLabelProps) {
  return (
    <Text
      className="mb-3 font-cairo-medium text-sm text-[#111111]"
      style={{ writingDirection: 'rtl' }}
    >
      {label}
      <RequirementMark required={required} />
    </Text>
  );
}

interface FormFieldProps extends FieldLabelProps {
  children: ReactNode;
  // Share a row with other fields
  flex?: boolean;
}

/** A labelled field; its parent sets the spacing between fields. */
export default function FormField({
  label,
  required,
  children,
  flex,
}: FormFieldProps) {
  return (
    <View className={flex ? 'flex-1' : 'w-full'}>
      <FieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

interface TextAreaFieldProps extends FieldLabelProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  testID?: string;
}

/** A labelled multi-line box, e.g. تفاصيل الاعلان. */
export function TextAreaField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  testID,
}: TextAreaFieldProps) {
  return (
    <FormField label={label} required={required}>
      <View className="h-[86px] w-full rounded-lg border border-[#ECECEC] bg-white px-3 py-3">
        <TextInput
          testID={testID}
          className="flex-1 text-right font-cairo text-[14px] leading-[21px] text-[#111111]"
          style={{ flex: 1, textAlign: 'right' }}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </FormField>
  );
}

/** The single-line input inside an INPUT_BOX_CLASS box. */
export function BoxTextInput(props: TextInputProps) {
  return (
    <TextInput
      className={INPUT_TEXT_CLASS}
      style={{ flex: 1, textAlign: 'right' }}
      placeholderTextColor={PLACEHOLDER_COLOR}
      {...props}
    />
  );
}
