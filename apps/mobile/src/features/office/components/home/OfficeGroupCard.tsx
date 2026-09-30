import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeGroupActivity } from '../../types';

interface OfficeGroupCardProps {
  group: OfficeGroupActivity;
  onPress?: () => void;
}

export default function OfficeGroupCard({
  group,
  onPress,
}: OfficeGroupCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[309px] rounded-[4px] border border-[#ECECEC] bg-white p-3.5"
      accessibilityRole="button"
      accessibilityLabel={`مجموعة ${group.groupName}`}
    >
      <View className="flex-row items-center justify-end gap-3">
        {/* Info Column */}
        <View className="flex-1 items-end">
          {/* Group Name */}
          <Text
            className="font-cairo-bold text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {group.groupName}
          </Text>

          {/* Message Row with Unread Badge */}
          <View className="mt-1 flex-row items-center justify-end gap-2">
            <Text
              className="flex-1 font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {group.lastMessage}
            </Text>
            {group.unreadCount > 0 && (
              <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#9C1E28]">
                <Text className="font-cairo-semibold text-[11px] leading-none text-white">
                  {group.unreadCount > 3
                    ? `${group.unreadCount}+`
                    : group.unreadCount === 3
                      ? '3+'
                      : group.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Time Ago */}
          <Text
            className="mt-1.5 font-cairo-medium text-[10px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {group.timeAgo}
          </Text>
        </View>

        {/* Group Avatar with Letter */}
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#15304D]">
          <Text className="font-cairo-bold text-[16px] text-white">
            {group.avatarLetter}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
