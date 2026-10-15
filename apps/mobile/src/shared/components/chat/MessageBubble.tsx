import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import MessageMeta from '@/shared/components/chat/MessageMeta';
import { MessageStatus } from '@/shared/utils/chatReceipts';

interface MessageProps {
  text: string;
  isMine: boolean;
  timestamp: string;
  // My message: sending / sent / delivered / read ticks
  status?: MessageStatus | null;
  // The message this one replies to, shown inside the bubble
  quote?: ReactNode;
}

const BUBBLE_SHADOW = {
  shadowColor: '#15304D',
  shadowOpacity: 0.15,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

/**
 * A text message (Figma 4410:168628 / 4410:168632). Mine: navy on the
 * right, the row's start under RTL. Theirs: light on the left. The time
 * and ticks sit under the bubble, as on every other kind of message.
 */
export default function MessageBubble({
  text,
  isMine,
  timestamp,
  status,
  quote,
}: MessageProps) {
  return (
    <View
      testID={isMine ? 'message-bubble-mine' : 'message-bubble-theirs'}
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[72%] ${isMine ? 'items-start' : 'items-end'}`}>
        <View
          className={`gap-[10px] rounded-[6px] px-5 py-3 ${
            isMine
              ? 'rounded-br-none bg-[#15304D]'
              : 'rounded-bl-none bg-[#F9FAFE]'
          }`}
          style={BUBBLE_SHADOW}
        >
          {quote}
          {/* No letter spacing: with a negative one iOS sized the bubble
              narrower than the Arabic text it drew, and the first and last
              letters were cut at the bubble's edges (QA). The line is tall
              enough for Cairo's marks above and below. */}
          <Text
            testID="message-bubble-text"
            className={`font-cairo-medium text-[14px] leading-[24px] ${
              isMine ? 'text-white' : 'text-[#111111]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            {text}
          </Text>
        </View>
        {/* Under the bubble, like every other kind of message */}
        <MessageMeta timestamp={timestamp} status={status} />
      </View>
    </View>
  );
}
