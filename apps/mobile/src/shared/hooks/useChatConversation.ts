import { FlashListRef } from '@shopify/flash-list';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

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
  // Replying to this message (swipe right, or رد in the options)
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  // The message whose long-press options are open
  const [optionsFor, setOptionsFor] = useState<ChatMessage | null>(null);
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
  const loadFailed = useChatStore(
    (state) => state.loadErrorConversationIds[conversationId] ?? false,
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

  // Back from another app, or the socket came back: catch up on what was
  // sent meanwhile (only delivered as pushes) and mark it read. The cache
  // stays on screen during the reload (QA: new messages only showed after
  // reopening the chat)
  useEffect(() => {
    if (!conversationId) return;
    const catchUp = () => {
      loadMessages(conversationId, undefined, true);
      useChatStore.getState().markConversationAsRead(conversationId);
    };
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') catchUp();
    });
    const unsubscribeReconnect = socketService.onReconnect(catchUp);
    return () => {
      appState.remove();
      unsubscribeReconnect();
    };
  }, [conversationId, loadMessages]);

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
    // No conversation yet (still being created): keep the text for later
    if (!conversationId || !inputText.trim()) return;
    const sent = sendMessage(conversationId, {
      content: inputText.trim(),
      type: 'TEXT',
      replyTo: replyTarget ?? undefined,
    });
    if (!sent) {
      // No socket exists at all -- keep the user's text in the input
      showAlert('خطأ', 'تعذر إرسال الرسالة، تحقق من اتصالك بالإنترنت');
      return;
    }
    setInputText('');
    setReplyTarget(null);
    requestAnimationFrame(() => {
      listRef?.current?.scrollToEnd({ animated: true });
    });
  }, [conversationId, inputText, listRef, sendMessage, replyTarget]);

  /** نسخ: the message text to the clipboard. */
  const copyMessage = useCallback(async (message: ChatMessage) => {
    if (!message.content) return;
    await Clipboard.setStringAsync(message.content);
    showAlert('تم النسخ', 'تم نسخ الرسالة');
  }, []);

  /** حذف لدي: gone here at once; back with an error if the server refuses. */
  const hideMessage = useCallback(
    async (message: ChatMessage) => {
      if (!conversationId) return;
      if (replyTarget?.id === message.id) setReplyTarget(null);
      try {
        await useChatStore.getState().hideMessage(conversationId, message.id);
      } catch {
        showAlert('خطأ', 'تعذر حذف الرسالة، حاول مرة أخرى');
      }
    },
    [conversationId, replyTarget],
  );

  const handleRetryLoad = useCallback(() => {
    if (conversationId) loadMessages(conversationId, undefined, true);
  }, [conversationId, loadMessages]);

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
    isLoadingMessages: isLoading,
    replyTarget,
    setReplyTarget,
    optionsFor,
    setOptionsFor,
    copyMessage,
    hideMessage,
    loadFailed,
    handleRetryLoad,
    handleSendMessage,
    handleLoadMore,
    // Older pages left to load (in-chat search keeps loading until a match is in)
    hasOlderMessages: !!hasNextPage,
  };
}
