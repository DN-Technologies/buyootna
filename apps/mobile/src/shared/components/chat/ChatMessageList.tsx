import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import DateSeparator from '@/shared/components/chat/DateSeparator';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
import ReplyQuote from '@/shared/components/chat/ReplyQuote';
import SwipeableMessage from '@/shared/components/chat/SwipeableMessage';
import { DisplayMessage, formatMessageTime } from '@/shared/utils/chatDate';

export interface ChatMessageListProps {
  listRef: React.RefObject<FlashListRef<any> | null>;
  messages: DisplayMessage[];
  onLoadMore: () => void;
  onPressProperty: (propertyId?: string) => void;
  // The tapped image's URL (opens the full-screen viewer)
  onPressImage: (imageUrl: string) => void;
  // Shows a spinner while there's nothing to show yet
  isLoading?: boolean;
  // The last load failed: shows a retry row instead of a silent blank chat
  loadFailed?: boolean;
  onRetry?: () => void;
  // Swipe right / رد, and the long-press options (optional for old callers)
  onReply?: (message: ChatMessage) => void;
  onLongPressMessage?: (message: ChatMessage) => void;
  // Shown on quotes of their messages ("أنت" for mine)
  otherUserName?: string;
}

// How long a message stays tinted after jumping to it from a quote
const HIGHLIGHT_MS = 1200;

// Device-local time with western digits, from the message's createdAt (the
// server's preformatted `timestamp` is only a fallback for odd dates)
const timeOf = (item: { createdAt?: string; timestamp?: string }) =>
  (item.createdAt && formatMessageTime(item.createdAt)) || item.timestamp || '';

export default function ChatMessageList({
  listRef,
  messages,
  onLoadMore,
  onPressProperty,
  onPressImage,
  isLoading = false,
  loadFailed = false,
  onRetry,
  onReply,
  onLongPressMessage,
  otherUserName = 'الطرف الآخر',
}: ChatMessageListProps) {
  // Tapping a quote scrolls to the original and tints it for a moment
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );
  const jumpTo = useCallback(
    (messageId: string) => {
      const index = messages.findIndex((m) => m.id === messageId);
      if (index < 0) return;
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedId(messageId);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(
        () => setHighlightedId(null),
        HIGHLIGHT_MS,
      );
    },
    [messages, listRef],
  );

  // Land on the newest message once the history first arrives. The list
  // stays mounted (it's never swapped for the spinner), and the explicit
  // scroll doesn't rely on FlashList 2.0.2's initial bottom positioning,
  // which left reopened short chats blank (QA)
  const hasScrolledToEnd = useRef(false);
  useEffect(() => {
    if (hasScrolledToEnd.current || messages.length === 0) return;
    hasScrolledToEnd.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [messages.length, listRef]);

  const renderBubble = useCallback(
    (item: ChatMessage) => {
      const quote = item.replyTo ? (
        <ReplyQuote
          reply={item.replyTo}
          otherName={otherUserName}
          // Their bubbles are dark
          onDark={!item.isMine && item.type === 'TEXT'}
          onPress={() => jumpTo(item.replyTo!.id)}
        />
      ) : undefined;

      switch (item.type) {
        case 'PROPERTY':
          if (!item.property) return null;
          return (
            <PropertyMessageBubble
              property={item.property}
              isMine={item.isMine}
              timestamp={timeOf(item)}
              isRead={!item.sending}
              quote={quote}
              onPressProperty={() => {
                const propId = item.propertyId || item.property?.id;
                onPressProperty(propId);
              }}
            />
          );
        case 'IMAGE':
          if (!item.imageUrl) return null;
          return (
            <ImageMessageBubble
              imageUrl={item.imageUrl}
              isMine={item.isMine}
              timestamp={timeOf(item)}
              isRead={!item.sending}
              quote={quote}
              onPressImage={() => onPressImage(item.imageUrl!)}
            />
          );
        case 'TEXT':
        default:
          return (
            <MessageBubble
              text={item.content ?? ''}
              isMine={item.isMine}
              timestamp={timeOf(item)}
              isRead={!item.sending}
              quote={quote}
            />
          );
      }
    },
    [onPressImage, onPressProperty, otherUserName, jumpTo],
  );

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => {
      if (item.type === 'DATE') return <DateSeparator dateText={item.content} />;
      const bubble = renderBubble(item);
      if (!bubble) return null;
      // Not yet on the server: nothing to reply to or act on
      if (!onReply || item.sending || item.id.startsWith('temp-')) {
        return bubble;
      }
      return (
        <SwipeableMessage
          onReply={() => onReply(item)}
          onLongPress={() => onLongPressMessage?.(item)}
          highlighted={highlightedId === item.id}
        >
          {bubble}
        </SwipeableMessage>
      );
    },
    [renderBubble, onReply, onLongPressMessage, highlightedId],
  );

  const showSpinner = isLoading && messages.length === 0;

  return (
    <View className="flex-1">
      <FlashList
        ref={listRef}
        data={messages}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.type}
        // Re-render rows when the jumped-to message's tint changes
        extraData={highlightedId}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 0.2,
        }}
        onStartReached={onLoadMore}
        onStartReachedThreshold={0.5}
        renderItem={renderMessage}
      />

      {/* Over the list, so the list itself stays mounted while loading */}
      {showSpinner && (
        <View
          testID="chat-messages-loading"
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <ActivityIndicator size="large" color="#15304D" />
        </View>
      )}

      {loadFailed && !isLoading && (
        <TouchableOpacity
          testID="chat-messages-retry"
          activeOpacity={0.8}
          onPress={onRetry}
          className="absolute left-5 right-5 top-3 items-center rounded-xl bg-[#FEF2F2] py-2.5"
        >
          <Text className="font-cairo-medium text-[13px] text-[#B91C1C]">
            تعذر تحميل الرسائل · إعادة المحاولة
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
