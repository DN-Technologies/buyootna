import type { ConversationSummary } from '@/shared/api/chat.service';
import { lastMessagePreview } from '@/shared/utils/chatAttachments';
import { formatMessageTime } from '@/shared/utils/chatDate';
import { messageStatus } from '@/shared/utils/chatReceipts';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';

import type { ChatItemProps } from '../ChatListItem';

export type InboxTab = 'ALL' | 'UNREAD';

/** What a chat is about, for its row: a quote request, or the ad. */
export function contextTag(conversation: ConversationSummary) {
  if (conversation.requestContext) return 'طلب عرض سعر';
  const property = conversation.propertyContext;
  if (!property) return undefined;
  return [getArabicCategoryLabel(property.category), property.location]
    .filter(Boolean)
    .join(' ');
}

/** الكل: every loaded chat; غير المقروء: those with unread messages. */
export const chatsForTab = (
  conversations: ConversationSummary[],
  tab: InboxTab,
) =>
  tab === 'ALL'
    ? conversations
    : conversations.filter((chat) => (chat.unreadCount ?? 0) > 0);

/** A chat's row on the list, from the conversation and the live signals. */
export function rowProps(
  item: ConversationSummary,
  live: { isOnline: boolean; isTyping: boolean },
): Omit<ChatItemProps, 'onPress'> {
  return {
    id: item.id,
    status: item.lastMessage?.isMine
      ? messageStatus(item.lastMessage, item.otherReceipt)
      : null,
    user: {
      name: item.otherUser?.name || 'محادثة',
      avatarUrl: item.otherUser?.avatarUrl,
      isOnline: live.isOnline,
    },
    propertyContext: contextTag(item),
    isTyping: live.isTyping,
    lastMessage: lastMessagePreview(item.lastMessage),
    // 12-hour, western digits, the phone's time zone
    timestamp: item.lastMessage
      ? formatMessageTime(item.lastMessage.createdAt)
      : '',
    unreadCount: item.unreadCount,
  };
}
