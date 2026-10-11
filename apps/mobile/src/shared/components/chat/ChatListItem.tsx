import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
import { MessageStatus } from '@/shared/utils/chatReceipts';

export interface ChatItemProps {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  propertyContext?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  // The tick on my last message (nothing when the last one is theirs)
  status?: MessageStatus | null;
  onPress: () => void;
}

export default function ChatListItem({
  user,
  propertyContext,
  lastMessage,
  timestamp,
  unreadCount = 0,
  status,
  onPress,
}: ChatItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="border-b border-gray-50 bg-white px-4 py-3"
    >
      <View className="flex-row items-start gap-3">
        {/* Right: Avatar */}
        <View className="relative">
          <Image
            source={{ uri: user.avatarUrl }}
            className="h-11 w-11 rounded-full bg-gray-100"
          />
          {user.isOnline && (
            <View className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
          )}
        </View>

        {/* Middle: Content */}
        <View className="flex-1 justify-center">
          {/* Name (right) + timestamp (left) */}
          <View className="flex-row items-center justify-between">
            <Text
              className="font-cairo-medium text-[15px] text-[#111111]"
              numberOfLines={1}
            >
              {user.name}
            </Text>
            <Text className="font-cairo text-[12px] text-[#6B6A6A]">
              {timestamp}
            </Text>
          </View>

          {/* Context tag + arrow */}
          {propertyContext ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Text
                className="font-cairo text-[12px] text-[#6B6A6A]"
                numberOfLines={1}
                style={{ writingDirection: 'rtl' }}
              >
                {propertyContext}
              </Text>
              <Feather name="arrow-up-left" size={12} color="#6B6A6A" />
            </View>
          ) : null}

          {/* Preview + status */}
          <View className="mt-1 flex-row items-center justify-between">
            <Text
              // No explicit alignment: the text starts on the right, under the
              // name (text-right flipped it to the left in this RTL app)
              className={`flex-1 font-cairo text-[13px] ${
                unreadCount > 0 ? 'text-[#111111]' : 'text-[#ADB5BD]'
              }`}
              numberOfLines={1}
              style={{ writingDirection: 'rtl' }}
            >
              {lastMessage}
            </Text>
            <View className="ml-2 h-5 w-5 items-center justify-center">
              {unreadCount > 0 ? (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-[#9C1E28]">
                  <Text className="font-cairo-semibold text-[11px] text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              ) : (
                <MessageTicks status={status} />
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
