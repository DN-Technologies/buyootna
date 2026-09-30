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
    <View className="flex-row items-center justify-between pb-3 pt-2">
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
      <Text
        className="font-cairo-bold text-[18px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
    </View>
  );
}
