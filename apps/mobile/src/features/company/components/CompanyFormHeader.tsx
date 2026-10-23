import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { BackChevronIcon } from '@/assets/icons/activity';

interface CompanyFormHeaderProps {
  title: string;
  onBack: () => void;
  // On the left, in place of the blank (e.g. معرض الأعمال's ⋮)
  trailing?: ReactNode;
}

// Figma "pages title" of the company "+" flows: back on the right, the
// title centred, a matching blank on the left
export default function CompanyFormHeader({
  title,
  onBack,
  trailing,
}: CompanyFormHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-[6px]">
      <TouchableOpacity
        testID="company-form-back"
        accessibilityLabel="رجوع"
        activeOpacity={0.7}
        onPress={onBack}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        {/* The asset points left; the back arrow points right under RTL */}
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <BackChevronIcon color="#111111" />
        </View>
      </TouchableOpacity>

      <Text
        className="flex-1 text-center font-cairo-semibold text-[18px] leading-[24px] text-[#111111]"
        numberOfLines={1}
      >
        {title}
      </Text>

      {trailing ?? <View className="h-8 w-8" />}
    </View>
  );
}
