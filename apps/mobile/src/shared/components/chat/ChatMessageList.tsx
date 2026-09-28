import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

import DateSeparator from '@/shared/components/chat/DateSeparator';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
import { DisplayMessage } from '@/shared/utils/chatDate';

export interface ChatMessageListProps {
  listRef: React.RefObject<FlashListRef<any> | null>;
  messages: DisplayMessage[];
  onLoadMore: () => void;
  onPressProperty: (propertyId?: string) => void;
  onPressImage: () => void;
  // Shows a spinner while there's nothing to show yet
  isLoading?: boolean;
}

export default function ChatMessageList({
  listRef,
  messages,
  onLoadMore,
  onPressProperty,
  onPressImage,
  isLoading = false,
}: ChatMessageListProps) {
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
              timestamp={item.timestamp}
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
              timestamp={item.timestamp}
              isRead={!item.sending}
              onPressImage={onPressImage}
            />
          );
        case 'TEXT':
        default:
          return (
            <MessageBubble
              text={item.content ?? ''}
              isMine={item.isMine}
              timestamp={item.timestamp}
              isRead={!item.sending}
            />
          );
      }
    },
    [onPressImage, onPressProperty],
  );

  if (isLoading && messages.length === 0) {
    return (
      <View
        testID="chat-messages-loading"
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="#15304D" />
      </View>
    );
  }

  return (
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
  );
}
