import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
import { MessageStatus } from '@/shared/utils/chatReceipts';

interface ImageMessageProps {
  imageUrl: string;
  isMine: boolean;
  timestamp: string;
  // My message: sending / sent / delivered / read ticks
  status?: MessageStatus | null;
  quote?: ReactNode;
  onPressImage?: () => void;
}

export default function ImageMessageBubble({
  imageUrl,
  isMine,
  timestamp,
  status,
  quote,
  onPressImage,
}: ImageMessageProps) {
  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[75%] ${isMine ? 'items-start' : 'items-end'}`}>
        {/* The message this one replies to */}
        {quote}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressImage}
          className={`overflow-hidden rounded-lg ${
            isMine ? 'rounded-br-none bg-[#15304D]' : 'rounded-bl-none bg-[#F9FAFE]'
          }`}
          style={{
            shadowColor: '#15304D',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Image
            source={{ uri: imageUrl }}
            className="h-40 w-56"
            contentFit="cover"
          />
        </TouchableOpacity>

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
