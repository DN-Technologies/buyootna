import type { ReactNode } from 'react';
import {
  Switch,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

// The building blocks of the office إضافة إعلان form's fields.

const INPUT_CLASS =
  'h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]';
const PLACEHOLDER_COLOR = '#979797';

interface OfficeFieldProps {
  label: string;
  // Adds the red star after the label
  required?: boolean;
  // Share a row with another field
  flex?: boolean;
  children: ReactNode;
}

/** A label over its control. */
export function OfficeField({
  label,
  required,
  flex,
  children,
}: OfficeFieldProps) {
  return (
    <View className={`${flex ? 'flex-1' : 'w-full'} flex-col gap-1.5`}>
      {required ? (
        <View className="flex-row items-center justify-end">
          <Text className="text-sm font-cairo-medium text-[#111111]">
            {label}
          </Text>
          <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
            *
          </Text>
        </View>
      ) : (
        <Text className="text-right font-cairo-medium text-sm text-[#111111]">
          {label}
        </Text>
      )}
      {children}
    </View>
  );
}

type OfficeTextFieldProps = Omit<OfficeFieldProps, 'children'> &
  Pick<
    TextInputProps,
    'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'testID'
  >;

/** A labelled single-line input. */
export function OfficeTextField({
  label,
  required,
  flex,
  ...input
}: OfficeTextFieldProps) {
  return (
    <OfficeField label={label} required={required} flex={flex}>
      <TextInput
        placeholderTextColor={PLACEHOLDER_COLOR}
        className={INPUT_CLASS}
        {...input}
      />
    </OfficeField>
  );
}

interface OfficeTextAreaProps
  extends Omit<OfficeFieldProps, 'children' | 'flex'>,
    Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'testID'> {
  // The ad description is the taller box
  tall?: boolean;
}

/** A labelled multi-line box. */
export function OfficeTextArea({
  label,
  required,
  tall,
  ...input
}: OfficeTextAreaProps) {
  return (
    <OfficeField label={label} required={required}>
      <TextInput
        placeholderTextColor={PLACEHOLDER_COLOR}
        multiline
        numberOfLines={tall ? 3 : 2}
        textAlignVertical={tall ? 'top' : undefined}
        className={`${tall ? 'min-h-[100px]' : 'min-h-[80px]'} rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]`}
        {...input}
      />
    </OfficeField>
  );
}

interface OfficePickerFieldProps extends Omit<OfficeFieldProps, 'children'> {
  value: string;
  placeholder: string;
  onPress: () => void;
  testID?: string;
}

/** A labelled box that opens a picker. */
export function OfficePickerField({
  label,
  required,
  flex,
  value,
  placeholder,
  onPress,
  testID,
}: OfficePickerFieldProps) {
  return (
    <OfficeField label={label} required={required} flex={flex}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="h-[46px] justify-center rounded-md border border-[#ECECEC] bg-white px-3"
        testID={testID}
      >
        <Text
          className={`text-right font-cairo-regular text-sm ${
            value ? 'text-[#111111]' : 'text-[#979797]'
          }`}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </OfficeField>
  );
}

interface OfficeToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

/** A boxed switch with its label. */
export function OfficeToggleRow({
  label,
  value,
  onValueChange,
  testID,
}: OfficeToggleRowProps) {
  return (
    <View className="w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3 py-2">
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ECECEC', true: '#15304D' }}
        thumbColor="#FFFFFF"
        testID={testID}
      />
      <Text className="font-cairo-medium text-sm text-[#111111]">{label}</Text>
    </View>
  );
}

/** A section heading, e.g. معلومات العقار. */
export function OfficeSectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-right font-cairo-semibold text-lg text-black">
      {children}
    </Text>
  );
}
