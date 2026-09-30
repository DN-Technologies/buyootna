import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeListingType } from '../../types';

export interface ListingTypeSelectorProps {
  value: OfficeListingType;
  onChange: (type: OfficeListingType) => void;
}

const OPTIONS: { type: OfficeListingType; label: string }[] = [
  { type: 'exchange', label: 'بدل' },
  { type: 'rent', label: 'إيجار' },
  { type: 'sell', label: 'بيع' },
];

export function ListingTypeSelector({
  value,
  onChange,
}: ListingTypeSelectorProps) {
  return (
    <View className="w-full flex-col gap-3" testID="listing-type-selector">
      <Text className="text-right font-cairo-semibold text-lg text-black">
        نوع الإعلان
      </Text>

      <View className="h-10 w-full flex-row items-center justify-end rounded-md bg-white px-2 shadow-sm">
        {OPTIONS.map((item) => {
          const isSelected = value === item.type;
          return (
            <TouchableOpacity
              key={item.type}
              activeOpacity={0.8}
              onPress={() => onChange(item.type)}
              className="h-10 flex-1 flex-row items-center justify-end gap-2 px-1"
              testID={`listing-type-${item.type}`}
            >
              <Text
                className={`font-cairo-medium text-sm text-[#111111] ${
                  isSelected ? 'font-cairo-bold' : ''
                }`}
              >
                {item.label}
              </Text>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={isSelected ? '#15304D' : '#979797'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default ListingTypeSelector;
