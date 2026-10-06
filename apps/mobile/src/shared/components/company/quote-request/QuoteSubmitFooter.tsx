import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface QuoteSubmitFooterProps extends BottomSheetFooterProps {
  bottomInset: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

// Pinned to the sheet's bottom, clear of the home indicator
export default function QuoteSubmitFooter({
  bottomInset,
  isSubmitting,
  onSubmit,
  ...footerProps
}: QuoteSubmitFooterProps) {
  return (
    <BottomSheetFooter {...footerProps}>
      <View
        className="border-t border-gray-100 bg-white px-6 pt-3"
        style={{ paddingBottom: bottomInset + 16 }}
      >
        <TouchableOpacity
          testID="quote-request-submit"
          activeOpacity={0.8}
          onPress={onSubmit}
          disabled={isSubmitting}
          className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="font-cairo-bold text-base leading-[24px] text-white">
              إرسال الطلب
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
}
