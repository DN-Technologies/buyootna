import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { ContextArrowIcon } from '@/assets/icons/chat';
import MessageTicks from '@/shared/components/chat/MessageTicks';
import { MessageStatus } from '@/shared/utils/chatReceipts';

export interface ChatItemProps {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  // What the chat is about: "طلب عرض سعر" or the ad ("شقة السالمية")
  propertyContext?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  // The tick on my last message (nothing when the last one is theirs)
  status?: MessageStatus | null;
  // The other person is writing: shown in place of the preview
  isTyping?: boolean;
  onPress: () => void;
}

// The API's stand-in for "no photo" is not a loadable image
const hasPhoto = (url?: string) =>
  !!url && /^https?:/.test(url) && !url.includes('no-image');

/**
 * One chat on the chats list (Figma 4410:167994): the avatar on the right
 * with its online dot, then the name over the tag over the preview; the
 * time and the unread badge (or my ticks) on the left.
 */
export default function ChatListItem({
  id,
  user,
  propertyContext,
  lastMessage,
  timestamp,
  unreadCount = 0,
  status,
  isTyping = false,
  onPress,
}: ChatItemProps) {
  return (
    <TouchableOpacity
      testID={`chat-list-item-${id}`}
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white px-4 pt-4"
    >
      <View className="flex-row items-start gap-3 border-b border-[#ECECEC] pb-2">
        <View>
          {hasPhoto(user.avatarUrl) ? (
            <Image
              source={{ uri: user.avatarUrl }}
              className="h-11 w-11 rounded-full bg-gray-100"
            />
          ) : (
            <View
              testID="chat-avatar-initial"
              className="h-11 w-11 items-center justify-center rounded-full bg-[#BEEFB9]"
            >
              <Text className="font-cairo-medium text-[16px] leading-[21px] text-[#0F1828]">
                {user.name.trim().charAt(0)}
              </Text>
            </View>
          )}
          {user.isOnline && (
            <View
              testID="chat-online-dot"
              // Physical bottom-right of the avatar: left/right swap under RTL
              className="absolute bottom-[1px] left-[5px] h-2 w-2 rounded-full border border-white bg-[#15A72B]"
            />
          )}
        </View>

        <View className="flex-1 gap-[2px]">
          {/* Name (right) + time (left) */}
          <View className="h-[19px] flex-row items-center justify-between gap-2">
            <Text
              className="shrink font-cairo-semibold text-[14px] leading-[19px] text-[#111111]"
              style={{ letterSpacing: 0.28 }}
              numberOfLines={1}
            >
              {user.name}
            </Text>
            <Text className="font-cairo text-[12px] leading-[15px] text-[#A4A4A4]">
              {timestamp}
            </Text>
          </View>

          {propertyContext ? (
            <View className="flex-row items-center gap-[2px] pt-1">
              <View style={{ transform: [{ scaleY: -1 }] }}>
                <ContextArrowIcon />
              </View>
              <Text
                className="shrink font-cairo text-[12px] leading-[16px] text-[#15304D]"
                numberOfLines={1}
                style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
              >
                {propertyContext}
              </Text>
            </View>
          ) : null}

          {/* Preview (right) + unread badge or my ticks (left) */}
          <View className="h-5 flex-row items-center justify-between gap-2">
            <Text
              testID={isTyping ? 'chat-list-typing' : undefined}
              // No explicit alignment: the text starts on the right, under the
              // name (text-right flipped it to the left in this RTL app)
              className={`flex-1 font-cairo-medium text-[13px] leading-[20px] ${
                isTyping
                  ? 'text-[#15A72B]'
                  : unreadCount > 0
                    ? 'text-[#111111]'
                    : 'text-[#ADB5BD]'
              }`}
              numberOfLines={1}
              style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
            >
              {isTyping ? 'يكتب الان...' : lastMessage}
            </Text>
            <View className="h-5 min-w-[20px] items-center justify-center">
              {unreadCount > 0 ? (
                <View
                  testID="chat-unread-badge"
                  className="h-5 min-w-[20px] items-center justify-center rounded-full bg-[#9C1E28] px-1"
                >
                  <Text className="font-cairo-semibold text-[12px] leading-[14px] text-white">
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
