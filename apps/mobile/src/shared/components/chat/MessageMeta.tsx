import { Text, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
import { MessageStatus } from '@/shared/utils/chatReceipts';

/**
 * The time (and my ticks) under a chat bubble, on the bubble's own side.
 * Every kind of message uses this one row: the time sat beside text
 * bubbles, beside or under the others, in three sizes, so the times didn't
 * line up down the chat (QA).
 */
export default function MessageMeta({
  timestamp,
  status,
}: {
  timestamp: string;
  // My message: sending / sent / delivered / read; nothing on theirs
  status?: MessageStatus | null;
}) {
  return (
    <View testID="message-meta" className="mt-1 flex-row items-center gap-1 px-1">
      <MessageTicks status={status} />
      <Text
        testID="message-bubble-time"
        // A 14px line cut the top of the Cairo digits on iOS
        className="font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
        style={{ letterSpacing: 0.26 }}
      >
        {timestamp}
      </Text>
    </View>
  );
}
