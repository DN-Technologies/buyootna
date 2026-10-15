import { Text, TouchableOpacity, View } from 'react-native';

import SectionTitle from '@/shared/components/add-listing/SectionTitle';
import type { ListingType } from '@/shared/store/useListingStore';

const OPTIONS: { id: ListingType; label: string }[] = [
  { id: 'sell', label: 'بيع' },
  { id: 'rent', label: 'إيجار' },
  { id: 'exchange', label: 'بدل' },
];

interface ListingTypeRadiosProps {
  value: ListingType;
  onChange: (type: ListingType) => void;
}

/** نوع الإعلان: بيع / إيجار / بدل. */
export default function ListingTypeRadios({
  value,
  onChange,
}: ListingTypeRadiosProps) {
  return (
    <View className="w-full" style={{ gap: 12 }}>
      <SectionTitle>نوع الإعلان</SectionTitle>

      <View className="h-10 flex-row items-center" style={{ gap: 4 }}>
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              testID={`listing-type-${option.id}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              activeOpacity={0.8}
              onPress={() => onChange(option.id)}
              className="h-10 flex-1 flex-row items-center"
              style={{ gap: 8 }}
            >
              <View
                className={`h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] ${
                  selected ? 'border-[#15304D]' : 'border-[#D7D7D7]'
                }`}
              >
                {selected && (
                  <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                )}
              </View>
              {/* Android cut the last letter ('إيجار' showed as 'ايجا', QA):
                  its default measuring under-sizes Cairo's last glyph */}
              <Text
                testID={`listing-type-label-${option.id}`}
                numberOfLines={1}
                textBreakStrategy="simple"
                className="px-0.5 font-cairo-medium text-sm leading-[22px] text-[#111111]"
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
