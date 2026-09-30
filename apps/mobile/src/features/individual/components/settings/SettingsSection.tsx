import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

// A titled group of rows on the settings screen
export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text
        className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <View className="rounded-xl bg-[#F9FAFE] px-4">{children}</View>
    </View>
  );
}
