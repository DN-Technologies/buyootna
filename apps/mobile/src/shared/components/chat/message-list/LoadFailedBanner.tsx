import { Text, TouchableOpacity } from 'react-native';

/** The last load failed: a retry row instead of a silent blank chat. */
export default function LoadFailedBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <TouchableOpacity
      testID="chat-messages-retry"
      activeOpacity={0.8}
      onPress={onRetry}
      className="absolute left-5 right-5 top-3 items-center rounded-xl bg-[#FEF2F2] py-2.5"
    >
      <Text className="font-cairo-medium text-[13px] text-[#B91C1C]">
        تعذر تحميل الرسائل · إعادة المحاولة
      </Text>
    </TouchableOpacity>
  );
}
