import { Image, Text, TouchableOpacity, View } from 'react-native';

import { OfficeConversation } from '../../types';

interface OfficeConversationCardProps {
  conversation: OfficeConversation;
  onPress?: () => void;
}

export default function OfficeConversationCard({
  conversation,
  onPress,
}: OfficeConversationCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[309px] rounded-[4px] border border-[#ECECEC] bg-white p-3.5"
      accessibilityRole="button"
      accessibilityLabel={`محادثة مع ${conversation.clientName}`}
    >
      <View className="flex-row items-start justify-end gap-3">
        {/* Info Column */}
        <View className="flex-1 items-end">
          {/* Tag Pill */}
          <View className="rounded-bl-[10px] rounded-tl-[10px] rounded-tr-[8px] bg-[#F9FAFE] px-2 py-0.5">
            <Text
              className="font-cairo text-[12px] text-[#15304D]"
              style={{ writingDirection: 'rtl' }}
            >
              {conversation.categoryTag}
            </Text>
          </View>

          {/* Client Name */}
          <Text
            className="mt-1 font-cairo-bold text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {conversation.clientName}
          </Text>

          {/* Message Row with Unread Badge */}
          <View className="mt-1 flex-row items-center justify-end gap-2">
            <Text
              className="flex-1 font-cairo-medium text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
            {conversation.unreadCount > 0 && (
              <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#9C1E28]">
                <Text className="font-cairo-semibold text-[11px] leading-none text-white">
                  {conversation.unreadCount > 3
                    ? `${conversation.unreadCount}+`
                    : conversation.unreadCount === 3
                      ? '3+'
                      : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Time Ago */}
          <Text
            className="mt-1.5 font-cairo-medium text-[10px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {conversation.timeAgo}
          </Text>
        </View>

        {/* Client Avatar */}
        <View className="h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
          <Image
            source={{
              uri:
                conversation.avatarUrl ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
