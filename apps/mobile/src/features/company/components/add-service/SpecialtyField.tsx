import { Text, TouchableOpacity, View } from 'react-native';

import DropdownField from './DropdownField';
import { SPECIALTIES } from './serviceCatalog';

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
            className="h-9 w-full flex-row items-center p-2"
          >
            <Text
              className={`flex-1 text-[13px] ${
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
