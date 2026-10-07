import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import DateSeparator from '@/shared/components/chat/DateSeparator';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
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
}

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
}: ChatMessageListProps) {
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

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => {
      switch (item.type) {
        case 'DATE':
          return <DateSeparator dateText={item.content} />;
        case 'PROPERTY':
          if (!item.property) return null;
          return (
            <PropertyMessageBubble
              property={item.property}
              isMine={item.isMine}
              timestamp={timeOf(item)}
              isRead={!item.sending}
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
            />
          );
      }
    },
    [onPressImage, onPressProperty],
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
