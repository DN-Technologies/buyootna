import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CompanyBottomBarProps {
  onRequestQuote: () => void;
  // The viewer's own company: no quote request to yourself
  disabled?: boolean;
}

export default function CompanyBottomBar({
  onRequestQuote,
  disabled = false,
}: CompanyBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-3"
    >
      <TouchableOpacity
        testID="company-request-quote"
        activeOpacity={0.8}
        onPress={onRequestQuote}
        disabled={disabled}
        accessibilityState={{ disabled }}
        className={`h-12 w-full items-center justify-center rounded-full bg-[#15304D] ${
          disabled ? 'opacity-40' : ''
        }`}
      >
        <Text className="font-cairo-bold text-base leading-[24px] text-white">
          طلب عرض سعر
        </Text>
      </TouchableOpacity>
    </View>
  );
}
