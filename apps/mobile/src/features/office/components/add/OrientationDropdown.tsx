import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface OrientationDropdownProps {
  value?: string;
  onSelect?: (value: string) => void;
  testID?: string;
}

export const ORIENTATION_OPTIONS = [
  'بطن وظهر',
  'زاوية',
  'شارع واحد',
  'ثلاث شوارع',
  'ثلاث شوارع - غير متصلة',
  'شارعين زاوية - غير متصلين',
];

export function OrientationDropdown({
  value,
  onSelect,
  testID = 'orientation-dropdown',
}: OrientationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect?.(option);
    setIsOpen(false);
  };

  return (
    <View className="w-full flex-col gap-1.5" testID={testID}>
      {/* Label */}
      <Text className="text-right font-cairo-medium text-sm text-[#111111]">
        المزايا
      </Text>

      {/* Trigger Box matching Figma 4494:142357 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen((prev) => !prev)}
        className="h-[46px] w-full flex-row items-center justify-between rounded-lg border border-[#ECECEC] bg-white px-3"
        testID="orientation-trigger"
        accessibilityLabel="ما يميز عقارك"
      >
        <View className="flex-row items-center gap-1.5">
          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#979797"
          />
          <Ionicons name="sparkles-outline" size={16} color="#15304D" />
        </View>

        <Text
          className={`font-cairo-regular text-sm ${
            value ? 'font-cairo-medium text-[#111111]' : 'text-[#979797]'
          }`}
          testID="orientation-value"
        >
          {value || 'ما يميز عقارك'}
        </Text>
      </TouchableOpacity>

      {/* Dropdown Options Popup matching Figma 4494:141814 */}
      {isOpen && (
        <View
          className="mt-1 w-full flex-col gap-1 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-sm"
          testID="orientation-menu"
        >
          {ORIENTATION_OPTIONS.map((item, index) => {
            const isSelected = value === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
                className={`h-9 w-full flex-row items-center justify-end rounded-md px-3 ${
                  isSelected ? 'bg-[#F4F8FB]' : 'bg-transparent'
                }`}
                testID={`orientation-option-${index}`}
              >
                <Text
                  className={`text-right font-cairo-medium text-[13px] ${
                    isSelected ? 'font-cairo-bold text-[#15304D]' : 'text-[#111111]'
                  }`}
                  style={{ writingDirection: 'rtl' }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default OrientationDropdown;
