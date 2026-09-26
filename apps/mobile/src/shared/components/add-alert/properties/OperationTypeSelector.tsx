import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { OPERATION_OPTIONS, type OperationType } from './constants';

export interface OperationTypeSelectorProps {
  value: OperationType;
  onChange: (value: OperationType) => void;
}

// نوع العملية: بيع / ايجار / بدل
export default function OperationTypeSelector({
  value,
  onChange,
}: OperationTypeSelectorProps) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-3 font-cairo-medium text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        نوع العملية
      </Text>
      <View className="flex-row items-center justify-between">
        {OPERATION_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.7}
              onPress={() => onChange(option.id)}
              className="flex-row items-center gap-2"
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? '#15304D' : '#D1D5DB'}
              />
              <Text
                className="font-cairo-medium text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
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
