import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface FeatureAdCheckoutButtonProps {
  price?: number;
  isProcessing: boolean;
  onPress: () => void;
}

// "إتمام الدفع • 3 د.ك"; inactive until a package is picked
export default function FeatureAdCheckoutButton({
  price,
  isProcessing,
  onPress,
}: FeatureAdCheckoutButtonProps) {
  const isActive = price !== undefined && !isProcessing;

  return (
    <View className="mt-4 pt-3">
      <TouchableOpacity
        testID="feature-ad-checkout-button"
        activeOpacity={0.8}
        disabled={!isActive}
        onPress={onPress}
        className={`h-[48px] w-full items-center justify-center rounded-[24px] ${
          price !== undefined ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
        }`}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
            {price !== undefined ? `إتمام الدفع • ${price} د.ك` : 'إتمام الدفع'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
