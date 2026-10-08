import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ReplyPreview } from '@/shared/api/chat.service';

import { quoteText } from './ReplyQuote';

/** Above the input while replying: what's being replied to, with ✕. */
export default function ReplyComposeBar({
  reply,
  otherName,
  onCancel,
}: {
  reply: ReplyPreview;
  otherName: string;
  onCancel: () => void;
}) {
  return (
    <View
      testID="reply-compose-bar"
      className="flex-row items-center border-t border-gray-100 bg-[#F9FAFE] px-4 py-2"
    >
      <View className="mr-3 w-1 self-stretch rounded-full bg-[#B28648]" />
      <View className="flex-1">
        <Text
          className="font-cairo-semibold text-[12px] text-[#B28648]"
          style={{ writingDirection: 'rtl' }}
        >
          {`الرد على ${reply.isMine ? 'نفسك' : otherName}`}
        </Text>
        <Text
          numberOfLines={1}
          className="font-cairo text-[12px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {quoteText(reply)}
        </Text>
      </View>
      <TouchableOpacity
        testID="reply-compose-cancel"
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="إلغاء الرد"
        className="p-1.5"
      >
        <Feather name="x" size={18} color="#6B6A6A" />
      </TouchableOpacity>
    </View>
  );
}
