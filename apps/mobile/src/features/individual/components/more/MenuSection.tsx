import { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface MenuSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled group of MenuItem rows -- the repeated section wrapper on the More screen. */
export default function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <View>
      <Text
        className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <View className="rounded-md bg-[#F9FAFE] px-4">{children}</View>
    </View>
  );
}
