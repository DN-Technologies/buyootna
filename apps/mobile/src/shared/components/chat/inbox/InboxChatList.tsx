import { FlashList } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { View } from 'react-native';

import type { ConversationSummary } from '@/shared/api/chat.service';

import ChatListItem from '../ChatListItem';
import { rowProps } from './inboxRow';

// 12 between the chat cards
const RowGap = () => <View className="h-3" />;

interface InboxChatListProps {
  chats: ConversationSummary[];
  onlineByIdentity: Record<string, boolean>;
  typingByConversation: Record<string, boolean>;
  onOpen: (conversationId: string) => void;
  empty: ReactElement | (() => ReactElement) | null;
  bottomPadding: number;
  // Search results: taps reach the rows while the keyboard is up
  persistTaps?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/** The chat cards, 12 apart, as the list or the search results. */
export default function InboxChatList({
  chats,
  onlineByIdentity,
  typingByConversation,
  onOpen,
  empty,
  bottomPadding,
  persistTaps = false,
  refreshing,
  onRefresh,
}: InboxChatListProps) {
  return (
    <FlashList
      data={chats}
      // Rows read live maps the list data doesn't hold
      extraData={[onlineByIdentity, typingByConversation]}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps={persistTaps ? 'handled' : undefined}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: bottomPadding,
      }}
      ItemSeparatorComponent={RowGap}
      ListEmptyComponent={empty}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <ChatListItem
          {...rowProps(item, {
            isOnline: !!onlineByIdentity[item.otherUser?.id],
            isTyping: !!typingByConversation[item.id],
          })}
          onPress={() => onOpen(item.id)}
        />
      )}
    />
  );
}
