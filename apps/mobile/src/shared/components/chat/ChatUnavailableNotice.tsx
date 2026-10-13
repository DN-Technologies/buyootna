import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Takes the message field's place when the other account is deleted,
 * suspended or blocked: nothing can be sent, and the chat stays readable.
 */
export default function ChatUnavailableNotice() {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="chat-unavailable-notice"
      accessibilityRole="alert"
      className="flex-row items-center justify-center gap-2 border-t border-[#ECECEC] bg-[#F9FAFE] px-4 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <Feather name="slash" size={16} color="#6B6A6A" />
      <View className="shrink">
        <Text className="text-center font-cairo-semibold text-[14px] leading-[24px] text-[#111111]">
          هذا المستخدم لم يعد متاحاً
        </Text>
        <Text className="text-center font-cairo text-[12px] leading-[20px] text-[#6B6A6A]">
          لا يمكن إرسال رسائل جديدة في هذه المحادثة.
        </Text>
      </View>
    </View>
  );
}
