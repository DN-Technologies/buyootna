import { Switch, Text, TextInput, View } from 'react-native';

import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface PriceToggleFieldProps {
  label?: string;
  showPrice: boolean;
  onTogglePrice: (val: boolean) => void;
  price: string;
  onChangePrice: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PriceToggleField({
  label = 'السعر',
  showPrice,
  onTogglePrice,
  price,
  onChangePrice,
  placeholder = 'بالدينار الكويتي',
  required = false,
}: PriceToggleFieldProps) {
  return (
    <View className="mb-6 w-full">
      <View className="mb-2 flex-row items-center justify-between">
        <Text
          className="font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {label} {showPrice && required && <Text className="text-red-500">*</Text>}
        </Text>
        <Switch
          value={showPrice}
          onValueChange={onTogglePrice}
          trackColor={{ false: '#E2E8F0', true: '#15304D' }}
          thumbColor={'#FFFFFF'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      {showPrice && (
        <View
          className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder={placeholder}
            placeholderTextColor="#979797"
            keyboardType="numeric"
            value={price}
            onChangeText={(text) => onChangePrice(toWesternDigits(text))}
          />
        </View>
      )}
    </View>
  );
}
