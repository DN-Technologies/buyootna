import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

export interface StepperInputProps {
  title: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  optional?: boolean;
  // 'lg' is the add-ad form's field: 46px tall
  size?: 'md' | 'lg';
}

export default function StepperInput({
  title,
  value,
  onChange,
  min = 1,
  max = 10,
  required,
  optional,
  size = 'md',
}: StepperInputProps) {
  const isLarge = size === 'lg';
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <View className="flex-1">
      <Text
        className={`font-cairo-medium text-sm text-[#111111] ${isLarge ? 'mb-3' : 'mb-1'}`}
        style={{
          writingDirection: 'rtl',
        }}
      >
        {title}
        <RequirementMark required={required} optional={optional} />
      </Text>

      <View
        className={`flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white ${isLarge ? 'h-[46px] px-3' : 'h-[40px] px-4'}`}
      >
        <TouchableOpacity
          onPress={handleIncrement}
          disabled={isAtMax}
          className="p-1"
        >
          <Feather
            name="plus"
            size={12}
            color={isAtMax ? '#D1D5DB' : '#111111'}
          />
        </TouchableOpacity>

        {/* Value */}
        <Text className="font-cairo text-sm leading-[22px] text-[#111111]">
          {value}
        </Text>

        {/* - Button */}
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={isAtMin}
          className="p-1"
        >
          <Feather
            name="minus"
            size={12}
            color={isAtMin ? '#D1D5DB' : '#111111'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
