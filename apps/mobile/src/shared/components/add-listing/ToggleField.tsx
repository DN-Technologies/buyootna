import type { ReactNode } from 'react';
import { Switch, Text, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  // Mark the label once the toggle is on and its input must be filled
  required?: boolean;
  testID?: string;
  // The input the toggle reveals
  children?: ReactNode;
}

/** A switch row that shows its input only while it is on. */
export default function ToggleField({
  label,
  value,
  onToggle,
  required,
  testID,
  children,
}: ToggleFieldProps) {
  return (
    <View className="w-full" style={{ gap: 4 }}>
      <View className="h-[30px] flex-row items-center justify-between">
        <Text
          className="font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {label}
          <RequirementMark required={value && required} />
        </Text>
        <Switch
          testID={testID}
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#6B6A6A', true: '#15304D' }}
          ios_backgroundColor="#6B6A6A"
          thumbColor="#FFFFFF"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>
      {value ? children : null}
    </View>
  );
}
