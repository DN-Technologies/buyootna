import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
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
 * right, the row's start under RTL. Theirs: light on the left. The ticks
 * and time sit beside the bubble, towards the middle of the screen.
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
      className={`mb-4 w-full flex-row items-end gap-2 ${
        isMine ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Theirs: the time comes first so it lands on the bubble's right */}
      {!isMine && <Meta timestamp={timestamp} />}

      <View
        className={`max-w-[72%] gap-[10px] rounded-[6px] px-5 py-3 ${
          isMine
            ? 'rounded-br-none bg-[#15304D]'
            : 'rounded-bl-none bg-[#F9FAFE]'
        }`}
        style={BUBBLE_SHADOW}
      >
        {quote}
        <Text
          className={`font-cairo-medium text-[14px] leading-[21px] ${
            isMine ? 'text-white' : 'text-[#111111]'
          }`}
          style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
        >
          {text}
        </Text>
      </View>

      {isMine && <Meta timestamp={timestamp} status={status} />}
    </View>
  );
}

// Ticks over the time, beside the bubble
const Meta = ({
  timestamp,
  status,
}: {
  timestamp: string;
  status?: MessageStatus | null;
}) => (
  <View className="items-start gap-1">
    <MessageTicks status={status} />
    <Text
      className="font-cairo text-[13px] leading-[14px] text-[#6B6A6A]"
      style={{ letterSpacing: 0.26 }}
    >
      {timestamp}
    </Text>
  </View>
);
