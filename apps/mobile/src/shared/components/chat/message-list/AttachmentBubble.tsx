import {
  ChatAttachment,
  ChatMessage,
  chatService,
} from '@/shared/api/chat.service';
import AttachmentMessageBubble from '@/shared/components/chat/AttachmentMessageBubble';
import VoiceMessageBubble from '@/shared/components/chat/VoiceMessageBubble';
import type { MessageStatus } from '@/shared/utils/chatReceipts';

import { timeOf } from './timeOf';

interface AttachmentBubbleProps {
  message: ChatMessage;
  status: MessageStatus | null;
  quote?: React.ReactElement;
  onOpenPhotos?: (urls: string[], index: number) => void;
  onOpenFile?: (attachment: ChatAttachment) => void;
  onOpenVideo?: (attachment: ChatAttachment) => void;
  onRetryAttachments?: (tempId: string) => void;
}

/**
 * Photos / documents / videos, or a 🎤 voice note (sent, or still uploading
 * from the device).
 */
export default function AttachmentBubble({
  message,
  status,
  quote,
  onOpenPhotos,
  onOpenFile,
  onOpenVideo,
  onRetryAttachments,
}: AttachmentBubbleProps) {
  const sent = message.attachments ?? [];
  const sentVoice = sent.find((a) => a.kind === 'AUDIO');
  const voice =
    sentVoice ?? message.localAttachments?.find((a) => a.kind === 'AUDIO');

  if (voice) {
    return (
      <VoiceMessageBubble
        tickStatus={status}
        uri={'url' in voice ? voice.url : voice.uri}
        durationMs={voice.durationMs}
        isMine={message.isMine}
        timestamp={timeOf(message)}
        quote={quote}
        sending={message.sending}
        failed={message.failed}
        onRetry={() => onRetryAttachments?.(message.id)}
        refreshUri={
          sentVoice ? () => chatService.attachmentUrl(sentVoice.id) : undefined
        }
      />
    );
  }

  return (
    <AttachmentMessageBubble
      status={status}
      message={message}
      timestamp={timeOf(message)}
      quote={quote}
      onPressPhoto={(index) =>
        onOpenPhotos?.(
          sent.filter((a) => a.kind === 'IMAGE').map((a) => a.url),
          index,
        )
      }
      onPressFile={(index) => {
        const file = sent.filter((a) => a.kind === 'FILE')[index];
        if (file) onOpenFile?.(file);
      }}
      onPressVideo={(index) => {
        const video = sent.filter((a) => a.kind === 'VIDEO')[index];
        if (video) onOpenVideo?.(video);
      }}
      onRetry={() => onRetryAttachments?.(message.id)}
    />
  );
}
