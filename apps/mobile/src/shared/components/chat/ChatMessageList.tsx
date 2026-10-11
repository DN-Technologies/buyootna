import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback } from 'react';
import { View } from 'react-native';

import {
  ChatAttachment,
  ChatMessage,
  ChatReceipt,
} from '@/shared/api/chat.service';
import DateSeparator from '@/shared/components/chat/DateSeparator';
import { ProposalAction } from '@/shared/components/chat/ProposalCard';
import SwipeableMessage from '@/shared/components/chat/SwipeableMessage';
import ChatMessagesSkeleton from '@/shared/components/skeletons/ChatMessagesSkeleton';
import { DisplayMessage } from '@/shared/utils/chatDate';

import ChatMessageBubble from './message-list/ChatMessageBubble';
import LoadFailedBanner from './message-list/LoadFailedBanner';
import { useMessageJump } from './message-list/useMessageJump';
import { useScrollToEndOnFirstLoad } from './message-list/useScrollToEndOnFirstLoad';

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
  // Attachments: the photos of a message (opens the viewer), a document,
  // and retrying a send that failed
  onOpenPhotos?: (urls: string[], index: number) => void;
  onOpenFile?: (attachment: ChatAttachment) => void;
  onOpenVideo?: (attachment: ChatAttachment) => void;
  onRetryAttachments?: (tempId: string) => void;
  // In-chat search: the current match to scroll to and highlight
  focusMessageId?: string | null;
  // Offers / appointments: answer, or open the counter form
  // How far the other person has received / read (my ticks)
  otherReceipt?: ChatReceipt | null;
  onRespondToProposal?: (message: ChatMessage, action: ProposalAction) => void;
  onCounterProposal?: (message: ChatMessage) => void;
}

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
  onOpenPhotos,
  onOpenFile,
  onOpenVideo,
  onRetryAttachments,
  focusMessageId,
  otherReceipt,
  onRespondToProposal,
  onCounterProposal,
}: ChatMessageListProps) {
  // Tapping a quote scrolls to the original and tints it for a moment
  const { highlightedId, jumpTo } = useMessageJump(
    messages,
    listRef,
    focusMessageId,
  );
  useScrollToEndOnFirstLoad(messages.length, listRef);

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => {
      if (item.type === 'DATE') return <DateSeparator dateText={item.content} />;
      const bubble = (
        <ChatMessageBubble
          message={item}
          otherReceipt={otherReceipt}
          otherUserName={otherUserName}
          onJumpTo={jumpTo}
          onPressProperty={onPressProperty}
          onPressImage={onPressImage}
          onOpenPhotos={onOpenPhotos}
          onOpenFile={onOpenFile}
          onOpenVideo={onOpenVideo}
          onRetryAttachments={onRetryAttachments}
          onRespondToProposal={onRespondToProposal}
          onCounterProposal={onCounterProposal}
        />
      );
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
    [
      otherReceipt,
      otherUserName,
      jumpTo,
      onPressProperty,
      onPressImage,
      onOpenPhotos,
      onOpenFile,
      onOpenVideo,
      onRetryAttachments,
      onRespondToProposal,
      onCounterProposal,
      onReply,
      onLongPressMessage,
      highlightedId,
    ],
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
        // Repaint on a jump highlight, and when the ticks change
        extraData={`${highlightedId}|${otherReceipt?.lastDeliveredAt}|${otherReceipt?.lastReadAt}`}
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
          className="absolute inset-0"
        >
          <ChatMessagesSkeleton />
        </View>
      )}

      {loadFailed && !isLoading && <LoadFailedBanner onRetry={onRetry} />}
    </View>
  );
}
