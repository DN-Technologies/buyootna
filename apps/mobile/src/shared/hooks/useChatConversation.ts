import { FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChatMessage } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';
import { DisplayMessage, withDateSeparators } from '@/shared/utils/chatDate';

// Stable reference so the "no messages cached yet" fallback doesn't create
// a new array on every store update.
const EMPTY_MESSAGES: ChatMessage[] = [];

export interface UseChatConversationParams {
  conversationId: string;
  listRef?: React.RefObject<FlashListRef<any> | null>;
}

export function useChatConversation({
  conversationId,
  listRef,
}: UseChatConversationParams) {
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPinnedContext, setShowPinnedContext] = useState(true);

  // Zustand Chat Store selectors — strictly keyed by conversationId
  // so concurrent mounted chat stack instances never leak messages across screens.
  const activeMessages = useChatStore(
    (state) => state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES,
  );
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const messageFailed = useChatStore((state) => state.messageFailed);
  const receiveMessage = useChatStore((state) => state.receiveMessage);
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );
  const pagination = useChatStore(
    (state) => state.paginationByConversation[conversationId],
  );
  const hasNextPage = pagination?.hasNextPage ?? false;
  const nextCursor = pagination?.nextCursor;
  const isLoading = useChatStore(
    (state) => state.loadingConversationIds[conversationId] ?? false,
  );

  const conversation = useChatStore((state) =>
    state.conversations.find((c) => c.id === conversationId),
  );

  const displayMessages: DisplayMessage[] = useMemo(
    () => withDateSeparators(activeMessages),
    [activeMessages],
  );

  const isHeaderLoading = !conversation;
  const otherUserName = conversation?.otherUser.name || 'مستخدم بيوتنا';
  const otherUserAvatar =
    conversation?.otherUser.avatarUrl || 'https://via.placeholder.com/150';
  const otherUserId = conversation?.otherUser.id;
  const propertyContext = conversation?.propertyContext;

  useEffect(() => {
    if (conversationId) {
      // Set active conversation and mark as read
      setActiveConversation(conversationId);
      loadMessages(conversationId, undefined, true);

      // Join socket room
      socketService.joinConversation(conversationId);

      // Listen for socket events
      const unsubscribe = socketService.onNewMessage((msg) => {
        receiveMessage(conversationId, msg);
      });

      // Optimistic bubble rollback on persistence failure
      const unsubscribeError = socketService.onMessageError((data) => {
        if (data.conversationId !== conversationId) return;
        messageFailed(conversationId, data.tempId);
        showAlert('خطأ', data.message || 'تعذر إرسال الرسالة');
      });

      return () => {
        setActiveConversation(null);
        socketService.leaveConversation(conversationId);
        unsubscribe();
        unsubscribeError();
      };
    }
  }, [
    conversationId,
    setActiveConversation,
    loadMessages,
    receiveMessage,
    messageFailed,
  ]);

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;
    const sent = sendMessage(conversationId, {
      content: inputText.trim(),
      type: 'TEXT',
    });
    if (!sent) {
      // No socket exists at all -- keep the user's text in the input
      showAlert('خطأ', 'تعذر إرسال الرسالة، تحقق من اتصالك بالإنترنت');
      return;
    }
    setInputText('');
    requestAnimationFrame(() => {
      listRef?.current?.scrollToEnd({ animated: true });
    });
  }, [conversationId, inputText, listRef, sendMessage]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading && nextCursor) {
      loadMessages(conversationId, nextCursor);
    }
  }, [conversationId, hasNextPage, isLoading, loadMessages, nextCursor]);

  return {
    inputText,
    setInputText,
    showAttachmentMenu,
    setShowAttachmentMenu,
    showMoreMenu,
    setShowMoreMenu,
    showImageOptions,
    setShowImageOptions,
    showPinnedContext,
    setShowPinnedContext,
    displayMessages,
    isHeaderLoading,
    otherUserName,
    otherUserAvatar,
    otherUserId,
    propertyContext,
    conversation,
    handleSendMessage,
    handleLoadMore,
  };
}
