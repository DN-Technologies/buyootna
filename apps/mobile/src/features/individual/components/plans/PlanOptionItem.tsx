import { Text, TouchableOpacity, View } from 'react-native';

import type { PlanOption } from './constants';

export interface PlanOptionItemProps {
  option: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PlanOptionItem({
  option,
  isSelected,
  onSelect,
}: PlanOptionItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      className={`flex-1 flex-row items-center gap-2 rounded-lg p-3 ${
        isSelected
          ? 'border border-[#15304D] bg-[#F5F7F9]'
          : 'border border-transparent bg-[#F5F7F9]'
      }`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full ${
          isSelected ? 'border-2 border-[#15304D]' : 'border border-[#D7D7D7]'
        }`}
      >
        {isSelected && (
          <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
        )}
      </View>
      <View className="items-start">
        <Text className="font-cairo-medium text-sm text-[#111111]">
          {option.label}
        </Text>
        <Text className="font-cairo-bold text-base text-[#111111]">
          {option.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
