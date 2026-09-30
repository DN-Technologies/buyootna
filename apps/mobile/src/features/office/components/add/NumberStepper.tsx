import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  testID?: string;
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  testID,
}: NumberStepperProps) {
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

  return (
    <View className="flex-1 flex-col gap-3" testID={testID}>
      <Text className="text-right font-cairo-medium text-sm text-[#111111]">
        {label}
      </Text>
      <View className="h-[46px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDecrement}
          disabled={value <= min}
          className="h-8 w-8 items-center justify-center rounded bg-[#F5F7F9]"
          testID={`${testID}-decrement`}
          accessibilityLabel={`إنقاص ${label}`}
        >
          <Feather
            name="minus"
            size={16}
            color={value <= min ? '#979797' : '#111111'}
          />
        </TouchableOpacity>

        <Text
          className="font-cairo-regular text-sm text-[#111111]"
          testID={`${testID}-value`}
        >
          {value}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleIncrement}
          disabled={value >= max}
          className="h-8 w-8 items-center justify-center rounded bg-[#F5F7F9]"
          testID={`${testID}-increment`}
          accessibilityLabel={`زيادة ${label}`}
        >
          <Feather
            name="plus"
            size={16}
            color={value >= max ? '#979797' : '#111111'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default NumberStepper;
