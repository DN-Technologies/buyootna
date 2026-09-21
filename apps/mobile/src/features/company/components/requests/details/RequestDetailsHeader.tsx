import { Text, TouchableOpacity, View } from 'react-native';

import { BackChevronIcon, ThreeDotsMenuIcon } from './icons';

export interface RequestDetailsHeaderProps {
  title?: string;
  onBackPress?: () => void;
  onOptionsPress?: () => void;
}

export default function RequestDetailsHeader({
  title = 'تفاصيل الطلب',
  onBackPress,
  onOptionsPress,
}: RequestDetailsHeaderProps) {
  return (
    <View className="h-[56px] bg-white px-4">
      {/* RTL Header: Child 0 is Visual Right (Back Button), Child 1 is Center Title, Child 2 is Visual Left (Options) */}
      <View className="flex-1 flex-row items-center justify-between">
        {/* Visual Right (Child 0): Back Button */}
        <TouchableOpacity
          testID="request-details-back-button"
          onPress={onBackPress}
          activeOpacity={0.7}
          className="size-[36px] items-center justify-center rounded-full"
          accessibilityLabel="الرجوع"
        >
          <BackChevronIcon size={22} color="#111111" />
        </TouchableOpacity>

        {/* Center: Title (flex-1 text-center keeps it perfectly centered) */}
        <Text
          testID="request-details-title"
          className="flex-1 text-center font-cairo-semibold text-[18px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>

        {/* Visual Left (Child 2): More Options */}
        <TouchableOpacity
          testID="request-details-options-button"
          onPress={onOptionsPress}
          activeOpacity={0.7}
          className="size-[36px] items-center justify-center rounded-full"
          accessibilityLabel="خيارات إضافية"
        >
          <ThreeDotsMenuIcon size={18} color="#111111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
