import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import type { ConversationSummary } from '@/shared/api/chat.service';
import Avatar from '@/shared/components/ui/Avatar';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
} from '@/shared/utils/helpers/property';

const CARD_WIDTH = 309;

interface HomeConversationCardProps {
  conversation: ConversationSummary;
}

export default function HomeConversationCard({
  conversation,
}: HomeConversationCardProps) {
  const router = useRouter();

  const categoryLabel = conversation.propertyContext
    ? getArabicCategoryLabel(conversation.propertyContext.category)
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{ width: CARD_WIDTH }}
      className="rounded border border-[#ECECEC] bg-white p-3.5"
      onPress={() =>
        router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })
      }
    >
      <View className="flex-row items-start justify-between gap-2">
        {/* Text content (right in RTL) */}
        <View className="flex-1 items-end gap-2">
          {categoryLabel ? (
            <View className="h-5 items-center justify-center rounded-tl-[10px] rounded-tr-lg rounded-bl-[10px] bg-[#F9FAFE] px-2">
              <Text
                className="font-cairo text-[12px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {categoryLabel}
              </Text>
            </View>
          ) : null}

          <Text
            className="font-cairo-bold text-[14px] leading-[21px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {conversation.otherUser?.name || 'محادثة'}
          </Text>

          <View className="h-[22px] w-full flex-row items-center justify-between">
            <Text
              className="flex-1 text-right font-cairo-medium text-[13px] leading-[20px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {conversation.lastMessage?.content || 'لا توجد رسائل'}
            </Text>
            {conversation.unreadCount > 0 && (
              <View className="mr-2 h-[22px] w-[22px] items-center justify-center rounded-full bg-[#9C1E28]">
                <Text className="font-cairo-semibold text-[11px] text-white">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <Text
            className="font-cairo-medium text-[10px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {formatTimeAgo(conversation.lastMessage?.createdAt ?? conversation.updatedAt)}
          </Text>
        </View>

        {/* Avatar (left in RTL) */}
        <View className="h-12 w-12 overflow-hidden rounded-full">
          <Avatar uri={conversation.otherUser?.avatarUrl} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
