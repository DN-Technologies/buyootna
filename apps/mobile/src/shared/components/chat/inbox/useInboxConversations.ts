import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';

import { useChatLiveSignals } from '@/shared/hooks/chat/useChatLiveSignals';
import { usePullToRefresh } from '@/shared/hooks/device/usePullToRefresh';
import { useReloadOnResume } from '@/shared/hooks/device/useReloadOnResume';
import { socketService } from '@/shared/services/socket.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatLiveStore } from '@/shared/store/useChatLiveStore';
import { useChatStore } from '@/shared/store/useChatStore';

/**
 * The inbox's chats, kept current: loaded on every focus and on coming back
 * to the app, updated live from the socket (new messages, read ticks), with
 * pull-to-refresh and who is online or typing.
 */
export function useInboxConversations() {
  const token = useAuthStore((state) => state.token);
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const isLoading = useChatStore((state) => state.isLoadingConversations);

  // Back from another app: pick up chats that changed meanwhile
  useReloadOnResume(() => loadConversations(1));
  const pullToRefresh = usePullToRefresh(
    useCallback(() => loadConversations(1, true), [loadConversations]),
  );

  // "متصل" dots and "يكتب الان..." rows
  useChatLiveSignals();
  const onlineByIdentity = useChatLiveStore((state) => state.onlineByIdentity);
  const typingByConversation = useChatLiveStore(
    (state) => state.typingByConversation,
  );

  // Refetch on every focus (not just first mount) so a conversation started
  // elsewhere (e.g. contacting a company/office from a property page) shows
  // up here immediately when the user navigates back to this screen, even
  // if it's still mounted from an earlier visit in the stack.
  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadConversations(1);
      }
    }, [token, loadConversations]),
  );

  useEffect(() => {
    if (!token) return;

    // Listen for socket events to update unread count / last message dynamically
    const unsubscribe = socketService.onConversationUpdated((data) => {
      receiveMessage(data.conversationId, data.lastMessage);
    });
    // The other person received / read a chat: the tick on my last message
    const unsubscribeReceipt = socketService.onConversationReceipt((receipt) =>
      useChatStore.getState().applyReceipt(receipt),
    );

    return () => {
      unsubscribe();
      unsubscribeReceipt();
    };
  }, [token, receiveMessage]);

  return {
    token,
    conversations,
    isLoading,
    pullToRefresh,
    onlineByIdentity,
    typingByConversation,
  };
}
