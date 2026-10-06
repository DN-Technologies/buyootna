import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface RequestQuoteSubmitButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function RequestQuoteSubmitButton({
  isSubmitting,
  onSubmit,
}: RequestQuoteSubmitButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    // Clear of the home indicator / nav bar (the screen's bottom edge isn't safe)
    <View
      className="border-t border-gray-100 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
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
