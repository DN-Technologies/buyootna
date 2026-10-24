import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface StudioSectionProps {
  title: string;
  hint?: string;
  action?: { label: string; onPress: () => void; testID?: string };
  children: ReactNode;
}

/** A studio section: its title (and a hint), an action on the left. */
export default function StudioSection({
  title,
  hint,
  action,
  children,
}: StudioSectionProps) {
  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-center justify-between px-4">
        <View className="flex-1 items-start">
          <Text className="font-cairo-bold text-[16px] leading-[24px] text-[#111111]">
            {title}
          </Text>
          {hint && (
            <Text className="font-cairo text-[12px] leading-[18px] text-[#6B6A6A]">
              {hint}
            </Text>
          )}
        </View>
        {action && (
          <TouchableOpacity
            testID={action.testID}
            accessibilityRole="button"
            hitSlop={8}
            onPress={action.onPress}
          >
            <Text className="font-cairo-semibold text-[14px] leading-[22px] text-[#15304D]">
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}
