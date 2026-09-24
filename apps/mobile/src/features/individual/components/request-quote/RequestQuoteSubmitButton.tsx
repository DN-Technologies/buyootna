import { Text, TouchableOpacity, View } from 'react-native';

export interface RequestQuoteSubmitButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function RequestQuoteSubmitButton({
  isSubmitting,
  onSubmit,
}: RequestQuoteSubmitButtonProps) {
  return (
    <View className="border-t border-gray-100 px-5 py-4">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSubmit}
        disabled={isSubmitting}
        className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
      >
        <Text className="font-cairo-bold text-base text-white">
          {isSubmitting ? 'جارِ الإرسال...' : 'ارسال الطلب'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
