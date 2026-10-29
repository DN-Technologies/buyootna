import { Text, TouchableOpacity, View } from 'react-native';

interface OfficeSectionHeaderProps {
  title: string;
  actionText?: string;
  onPressAction?: () => void;
}

export default function OfficeSectionHeader({
  title,
  actionText = 'عرض الكل',
  onPressAction,
}: OfficeSectionHeaderProps) {
  return (
    // RTL: the title (first) on the right, «عرض الكل» on the left
    <View className="flex-row items-center justify-between pb-3 pt-2">
      <Text
        className="font-almarai-bold text-[18px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      {onPressAction ? (
        <TouchableOpacity
          onPress={onPressAction}
          className="rounded-full px-2 py-1"
          accessibilityRole="button"
          accessibilityLabel={`${actionText} ${title}`}
        >
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
}
