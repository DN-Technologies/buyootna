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
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[75%] ${isMine ? 'items-start' : 'items-end'}`}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressImage}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-sm shadow-gray-200/50"
        >
          <Image
            source={{ uri: imageUrl }}
            className="h-40 w-56"
            contentFit="cover"
          />
        </TouchableOpacity>

        {/* Meta row (Timestamp & Read Receipt) */}
        <View className="mt-1.5 flex-row items-center space-x-1 space-x-reverse">
          {isMine && (
            <Feather
              name="check"
              size={12}
              color={isRead ? '#15304D' : '#94A3B8'}
            />
          )}
          <Text className="font-cairo-medium text-[10px] text-[#94A3B8]">
            {timestamp}
          </Text>
        </View>
      </View>
    </View>
  );
}
