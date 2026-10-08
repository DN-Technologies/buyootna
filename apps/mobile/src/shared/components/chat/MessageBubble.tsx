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

export default function MessageBubble({
  text,
  isMine,
  timestamp,
  status,
  quote,
}: MessageProps) {
  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[80%] ${isMine ? 'items-start' : 'items-end'}`}>
        {/* Bubble — mine: light on the right (row start in RTL), theirs: dark on the left */}
        <View
          className={`rounded-md px-5 py-3 ${
            isMine ? 'rounded-br-none bg-[#F9FAFE]' : 'rounded-bl-none bg-[#15304D]'
          }`}
          style={{
            shadowColor: '#15304D',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          {quote}
          <Text
            className={`text-right font-cairo-medium text-[14px] leading-6 ${
              isMine ? 'text-[#111111]' : 'text-white'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            {text}
          </Text>
        </View>

        {/* Meta row (outside, below the bubble) */}
        <View className="mt-1 flex-row items-center gap-1">
          <MessageTicks status={status} />
          <Text className="font-cairo text-[13px] text-[#6B6A6A]">
            {timestamp}
          </Text>
        </View>
      </View>
    </View>
  );
}
