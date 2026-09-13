import { Text, View } from 'react-native';

interface FieldLabelProps {
  text: string;
  required?: boolean;
}

export default function FieldLabel({ text, required = true }: FieldLabelProps) {
  return (
    <View className="flex-row items-center justify-end">
      <Text
        className="font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {text}
      </Text>
      {required && (
        <Text className="font-cairo-medium text-[14px] text-[#D12121]"> *</Text>
      )}
    </View>
  );
}
