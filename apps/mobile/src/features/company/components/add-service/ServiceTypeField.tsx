import { Text, TouchableOpacity, View } from 'react-native';

import { CheckboxOffIcon, CheckboxOnIcon } from '@/assets/icons/company-add';

import DropdownField from './DropdownField';

interface ServiceTypeFieldProps {
  options: string[];
  selected: string[];
  // Already added (or nothing left for "الكل"): ticked, greyed, not
  // pressable (Figma 8453:24047)
  disabled?: string[];
  label: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleType: (type: string) => void;
}

// نوع الخدمة: a checklist under the field (Figma 8455:24388); the box sits
// on the right of each row and a ticked row turns navy
export default function ServiceTypeField({
  options,
  selected,
  disabled = [],
  label,
  isOpen,
  onToggleOpen,
  onToggleType,
}: ServiceTypeFieldProps) {
  return (
    <DropdownField
      testID="service-types"
      label="نوع الخدمة"
      placeholder="اختر نوع الخدمة"
      value={label}
      isOpen={isOpen}
      onToggle={onToggleOpen}
    >
      <View className="gap-2">
        {options.map((option) => {
          const isDisabled = disabled.includes(option);
          const isSelected = isDisabled || selected.includes(option);
          return (
            <TouchableOpacity
              key={option}
              testID={`service-type-${option}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
              activeOpacity={0.7}
              disabled={isDisabled}
              onPress={() => onToggleType(option)}
              className="min-h-9 w-full flex-row items-center gap-2 px-2 py-1"
            >
              {isDisabled ? (
                <CheckboxOnIcon color="#A0A0A0" />
              ) : isSelected ? (
                <CheckboxOnIcon />
              ) : (
                <CheckboxOffIcon />
              )}
              <Text
                // Line height Cairo needs: a 20pt box cut the letters
                className={`flex-1 font-cairo-medium text-[14px] leading-[24px] ${
                  isDisabled
                    ? 'text-[#A0A0A0]'
                    : isSelected
                      ? 'text-[#15304D]'
                      : 'text-[#111111]'
                }`}
                style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
                numberOfLines={1}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </DropdownField>
  );
}
