import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

interface ImageMessageProps {
  imageUrl: string;
  isMine: boolean;
  timestamp: string;
  isRead?: boolean;
  onPressImage?: () => void;
}

export default function ImageMessageBubble({
  imageUrl,
  isMine,
  timestamp,
  isRead,
  onPressImage,
}: ImageMessageProps) {
  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <View className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressImage}
          className={`overflow-hidden rounded-lg ${
            isMine ? 'rounded-bl-none bg-[#F9FAFE]' : 'rounded-br-none bg-[#15304D]'
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
          {isMine && (
            <Feather
              name="check"
              size={14}
              color={isRead ? '#15304D' : '#94A3B8'}
            />
          )}
          <Text className="font-cairo text-[13px] text-[#6B6A6A]">
            {timestamp}
          </Text>
        </View>
      </View>
    </View>
  );
}
