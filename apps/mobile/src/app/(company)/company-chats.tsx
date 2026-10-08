import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatListItem from '@/shared/components/chat/ChatListItem';
import EmptyChatState from '@/shared/components/chat/EmptyChatState';
import ChatListSkeleton from '@/shared/components/skeletons/ChatSkeleton';
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh';
import { useReloadOnResume } from '@/shared/hooks/useReloadOnResume';
import { socketService } from '@/shared/services/socket.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
} from '@/shared/utils/helpers/property';

export default function CompanyChatsScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  // Back from another app: pick up chats that changed meanwhile
  useReloadOnResume(() => loadConversations(1));
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const isLoading = useChatStore((state) => state.isLoadingConversations);
  const pullToRefresh = usePullToRefresh(
    useCallback(() => loadConversations(1, true), [loadConversations]),
  );

  useEffect(() => {
    if (token) {
      loadConversations(1);

      // Keep unread counts / last message fresh while the tab is open
      const unsubscribe = socketService.onConversationUpdated((data) => {
        receiveMessage(data.conversationId, data.lastMessage);
      });

      return unsubscribe;
    }
  }, [token, loadConversations, receiveMessage]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-5 py-4">
        <Text
          className="font-cairo-bold text-lg text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المحادثات
        </Text>
      </View>

      {isLoading && conversations.length === 0 ? (
        <ChatListSkeleton count={6} />
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={EmptyChatState}
          refreshing={pullToRefresh.refreshing}
          onRefresh={pullToRefresh.onRefresh}
          renderItem={({ item }) => {
            const displayLastMessage = item.lastMessage
              ? item.lastMessage.type === 'IMAGE'
                ? '📷 صورة'
                : item.lastMessage.type === 'PROPERTY'
                  ? '🏠 مشاركة عقار'
                  : item.lastMessage.content || ''
              : 'بدء المحادثة';

            return (
              <ChatListItem
                id={item.id}
                user={{
                  name: item.otherUser?.name || 'محادثة',
                  avatarUrl: item.otherUser?.avatarUrl,
                  isOnline: false,
                }}
                propertyContext={
                  item.propertyContext
                    ? getArabicCategoryLabel(item.propertyContext.category)
                    : undefined
                }
                lastMessage={displayLastMessage}
                timestamp={
                  item.lastMessage
                    ? formatTimeAgo(item.lastMessage.createdAt)
                    : ''
                }
                unreadCount={item.unreadCount}
                onPress={() =>
                  router.push({
                    pathname: '/chat/[id]',
                    params: { id: item.id },
                  })
                }
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
