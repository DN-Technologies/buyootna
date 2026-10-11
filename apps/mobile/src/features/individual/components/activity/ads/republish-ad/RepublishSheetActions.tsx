import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface RepublishSheetActionsProps {
  // With no credit the primary button leads to the plans instead
  hasCredit: boolean;
  isLoading: boolean;
  onPrimaryPress: () => void;
  onCancel: () => void;
}

export default function RepublishSheetActions({
  hasCredit,
  isLoading,
  onPrimaryPress,
  onCancel,
}: RepublishSheetActionsProps) {
  return (
    <View className="gap-2 pt-4">
      <TouchableOpacity
        testID="republish-confirm-btn"
        activeOpacity={0.8}
        disabled={isLoading}
        onPress={onPrimaryPress}
        className="h-[48px] w-full items-center justify-center rounded-[24px] bg-[#15304D]"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
            {hasCredit ? 'إعادة النشر' : 'استعراض الباقات'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        testID="republish-cancel-btn"
        activeOpacity={0.8}
        onPress={onCancel}
        className="h-[48px] w-full items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
      >
        <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]">
          تراجع
        </Text>
      </TouchableOpacity>
    </View>
  );
}
