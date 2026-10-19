import { Text, TouchableOpacity, View } from 'react-native';

import { SPECIALTIES } from '@/shared/data/serviceCatalog';

import DropdownField from './DropdownField';

interface SpecialtyFieldProps {
  value: string;
  locked: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: (specialty: string) => void;
}

// التخصص: one choice from the list (Figma 4410:167821), locked once the
// company has a specialty
export default function SpecialtyField({
  value,
  locked,
  isOpen,
  onToggleOpen,
  onSelect,
}: SpecialtyFieldProps) {
  return (
    <DropdownField
      testID="service-specialty"
      label="التخصص"
      placeholder="اختر التخصص"
      value={value}
      isOpen={isOpen}
      onToggle={onToggleOpen}
      locked={locked}
    >
      <View className="gap-1">
        {SPECIALTIES.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            testID={`service-specialty-${specialty}`}
            activeOpacity={0.7}
            onPress={() => onSelect(specialty)}
            className="min-h-9 w-full flex-row items-center px-2 py-1"
          >
            <Text
              // A fixed 20pt text box cut Cairo's lower strokes: give it
              // the line height its glyphs need
              className={`flex-1 text-[13px] leading-[24px] ${
                specialty === value
                  ? 'font-cairo-semibold text-[#15304D]'
                  : 'font-cairo-medium text-[#111111]'
              }`}
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </DropdownField>
  );
}
