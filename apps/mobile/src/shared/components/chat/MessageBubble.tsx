import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface MessageProps {
  text: string;
  isMine: boolean;
  timestamp: string;
  isRead?: boolean;
}

export default function MessageBubble({
  text,
  isMine,
  timestamp,
  isRead,
}: MessageProps) {
  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[80%] ${isMine ? 'items-start' : 'items-end'}`}>
        {/* Bubble */}
        <View
          className={`rounded-2xl px-4 py-3 ${
            isMine
              ? 'rounded-tl-sm bg-[#15304D]'
              : 'rounded-tr-sm border border-gray-100 bg-white shadow-sm shadow-gray-200/50'
          }`}
        >
          <Text
            className={`text-right font-cairo-medium text-[14px] leading-6 ${
              isMine ? 'text-white' : 'text-[#111111]'
            }`}
          >
            {text}
          </Text>
        </View>

        {/* Meta row (Timestamp & Read Receipt) */}
        <View className="mt-1.5 flex-row items-center space-x-1 space-x-reverse">
          {isMine && (
            // Double checkmark for read, single for sent (mocked logic)
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
