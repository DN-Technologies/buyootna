import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
import { MessageStatus } from '@/shared/utils/chatReceipts';
import { nameInitials } from '@/shared/utils/nameInitials';

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
 * One chat on the chats list (Figma 9191:26630): a card, tinted while it has
 * unread messages. The avatar on the right with its online dot, then the
 * name over the ad tag over the preview; the time and the unread count (or
 * my ticks) on the left.
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
  const unread = unreadCount > 0;
  return (
    <TouchableOpacity
      testID={`chat-list-item-${id}`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        testID={`chat-list-card-${id}`}
        className={`flex-row items-start p-3 ${
          unread ? 'border-b border-[#F9FAFE] bg-[#F3F5FB]' : 'bg-white'
        }`}
        // Rounded but for the bottom right (bottom start, in this RTL app)
        style={{
          gap: 10,
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
          borderBottomEndRadius: 10,
          borderBottomStartRadius: 0,
        }}
      >
      <View className="h-11 w-11">
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
              {nameInitials(user.name)}
            </Text>
          </View>
        )}
        {user.isOnline && (
          <Image
            testID="chat-online-dot"
            source={require('@/assets/icons/chat/inbox/online-dot.svg')}
            // Bottom left of the avatar: left/right swap under RTL
            style={{ position: 'absolute', top: 35, right: 31, width: 8, height: 8 }}
          />
        )}
      </View>

      <View className="flex-1" style={{ gap: 2 }}>
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
          <View className="flex-row items-center pt-1" style={{ gap: 2 }}>
            <Image
              source={require('@/assets/icons/chat/inbox/context-arrow.svg')}
              style={{ width: 12, height: 12, transform: [{ scaleY: -1 }] }}
            />
            <Text
              className="shrink font-cairo-semibold text-[12px] leading-[16px] text-[#15304D]"
              numberOfLines={1}
              style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
            >
              {propertyContext}
            </Text>
          </View>
        ) : null}
        {/* Preview (right) + unread count or my ticks (left) */}
        <View className="h-5 flex-row items-center justify-between gap-2">
          <Text
            testID={isTyping ? 'chat-list-typing' : undefined}
            // No explicit alignment: the text starts on the right, under the
            // name (text-right flipped it to the left in this RTL app)
            className={`flex-1 font-cairo-medium text-[13px] leading-[20px] ${
              isTyping ? 'text-[#15A72B]' : 'text-[#ADB5BD]'
            }`}
            numberOfLines={1}
            style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
          >
            {isTyping ? 'يكتب الان...' : lastMessage}
          </Text>
          <View className="h-5 min-w-[20px] items-center justify-center">
            {unread ? (
              <View
                testID="chat-unread-badge"
                className="h-5 min-w-[20px] items-center justify-center rounded-full bg-[#15A72B] px-[5px]"
              >
                {/* The line is as tall as the badge: Cairo needs about
                    1.9x its size, and a 14px line pushed the digit up out
                    of the circle on iOS (QA) */}
                <Text
                  testID="chat-unread-count"
                  className="text-center font-cairo-semibold text-[12.5px] leading-[20px] text-white"
                  style={{ includeFontPadding: false }}
                  numberOfLines={1}
                >
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
