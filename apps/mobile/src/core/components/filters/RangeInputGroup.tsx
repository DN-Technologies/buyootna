import { Text, TextInput, View } from 'react-native';

export interface RangeInputGroupProps {
  title: string;
  minValue: string;
  maxValue: string;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  placeholderSuffix?: string; // e.g., 'د.ك' or 'م²'
}

export default function RangeInputGroup({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholderSuffix = '',
}: RangeInputGroupProps) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-1 font-cairo text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>

      <View className="flex-row gap-3">
        {/* MAX Input */}
        <View className="h-[40px] flex-1 flex-row items-center justify-between rounded-md border border-[#D7D7D7] bg-white px-4 py-1.5">
          <TextInput
            className="h-10 flex-1 font-cairo leading-[24px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            placeholder="الحد الأقصى"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            value={maxValue}
            onChangeText={onMaxChange}
          />
          <Text className="font-cairo text-xs leading-[22px] text-[#989898]">
            {placeholderSuffix}
          </Text>
        </View>

        {/* MIN Input */}
        <View className="h-[40px] flex-1 flex-row items-center justify-between rounded-md border border-[#D7D7D7] bg-white px-4 py-1.5">
          <TextInput
            className="h-10 flex-1 font-cairo leading-[24px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            placeholder="الحد الأدنى"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            value={minValue}
            onChangeText={onMinChange}
          />
          <Text className="font-cairo text-xs leading-[22px] text-[#989898]">
            {placeholderSuffix}
          </Text>
        </View>
      </View>
    </View>
  );
}
