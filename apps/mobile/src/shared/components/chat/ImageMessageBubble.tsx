import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';

import MessageMeta from '@/shared/components/chat/MessageMeta';
import { cachedImageSource } from '@/shared/utils/chatMediaCache';
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
            source={cachedImageSource(imageUrl)}
            cachePolicy="memory-disk"
            className="h-40 w-56"
            contentFit="cover"
          />
        </TouchableOpacity>

        <MessageMeta timestamp={timestamp} status={status} />
      </View>
    </View>
  );
}
