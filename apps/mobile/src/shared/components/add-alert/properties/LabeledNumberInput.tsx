import { Text, TextInput, View } from 'react-native';

export interface LabeledNumberInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
}

// Numeric text field with a label, used for price / rent / area / years
export default function LabeledNumberInput({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength,
}: LabeledNumberInputProps) {
  return (
    <View className="flex-1">
      <Text
        className="mb-1 font-cairo text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {label}
      </Text>
      <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
        <TextInput
          className="h-10 text-right font-cairo text-[13px] text-[#111111]"
          placeholder={placeholder}
          placeholderTextColor="#D1D5DB"
          keyboardType="numeric"
          maxLength={maxLength}
          value={value}
          onChangeText={onChangeText}
          style={{ writingDirection: 'rtl' }}
        />
      </View>
    </View>
  );
}
