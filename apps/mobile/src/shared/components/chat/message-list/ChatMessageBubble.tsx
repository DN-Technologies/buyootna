import {
  ChatAttachment,
  ChatMessage,
  ChatReceipt,
} from '@/shared/api/chat.service';
import ImageMessageBubble from '@/shared/components/chat/ImageMessageBubble';
import LocationMessageBubble from '@/shared/components/chat/LocationMessageBubble';
import MessageBubble from '@/shared/components/chat/MessageBubble';
import PropertyMessageBubble from '@/shared/components/chat/PropertyMessageBubble';
import ProposalCard, {
  ProposalAction,
} from '@/shared/components/chat/ProposalCard';
import ReplyQuote from '@/shared/components/chat/ReplyQuote';
import { messageStatus } from '@/shared/utils/chatReceipts';

import AttachmentBubble from './AttachmentBubble';
import { timeOf } from './timeOf';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  otherReceipt?: ChatReceipt | null;
  otherUserName: string;
  // Tapping a quote jumps to the original message
  onJumpTo: (messageId: string) => void;
  onPressProperty: (propertyId?: string) => void;
  onPressImage: (imageUrl: string) => void;
  onOpenPhotos?: (urls: string[], index: number) => void;
  onOpenFile?: (attachment: ChatAttachment) => void;
  onOpenVideo?: (attachment: ChatAttachment) => void;
  onRetryAttachments?: (tempId: string) => void;
  onRespondToProposal?: (message: ChatMessage, action: ProposalAction) => void;
  onCounterProposal?: (message: ChatMessage) => void;
}

/** The bubble for one message, chosen by what it holds. */
export default function ChatMessageBubble({
  message: item,
  otherReceipt,
  otherUserName,
  onJumpTo,
  onPressProperty,
  onPressImage,
  onOpenPhotos,
  onOpenFile,
  onOpenVideo,
  onRetryAttachments,
  onRespondToProposal,
  onCounterProposal,
}: ChatMessageBubbleProps) {
  const status = messageStatus(item, otherReceipt);
  const quote = item.replyTo ? (
    <ReplyQuote
      reply={item.replyTo}
      otherName={otherUserName}
      // My bubbles are navy
      onDark={item.isMine && item.type === 'TEXT'}
      onPress={() => onJumpTo(item.replyTo!.id)}
    />
  ) : undefined;

  // Photos / documents / voice notes (sent, or still uploading)
  if (item.attachments?.length || item.localAttachments?.length) {
    return (
      <AttachmentBubble
        message={item}
        status={status}
        quote={quote}
        onOpenPhotos={onOpenPhotos}
        onOpenFile={onOpenFile}
        onOpenVideo={onOpenVideo}
        onRetryAttachments={onRetryAttachments}
      />
    );
  }

  switch (item.type) {
    case 'LOCATION':
      if (!item.location) return null;
      return (
        <LocationMessageBubble
          status={status}
          location={item.location}
          isMine={item.isMine}
          timestamp={timeOf(item)}
          quote={quote}
        />
      );
    case 'APPOINTMENT':
    case 'OFFER':
      return (
        <ProposalCard
          status={status}
          message={item}
          timestamp={timeOf(item)}
          quote={quote}
          onRespond={(action) => onRespondToProposal?.(item, action)}
          onCounter={() => onCounterProposal?.(item)}
        />
      );
    case 'PROPERTY':
      if (!item.property) return null;
      return (
        <PropertyMessageBubble
          property={item.property}
          isMine={item.isMine}
          timestamp={timeOf(item)}
          status={status}
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
          status={status}
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
          status={status}
          quote={quote}
        />
      );
  }
}
