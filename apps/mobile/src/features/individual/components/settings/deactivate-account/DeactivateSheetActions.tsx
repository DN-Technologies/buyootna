import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface DeactivateSheetActionsProps {
  primaryLabel: string;
  primaryTestID: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  isLoading?: boolean;
  // Omit for a step without a cancel button (the OTP step closes via ✕)
  cancelTestID?: string;
  onCancel?: () => void;
  className?: string;
}

// The amber primary button, optionally with "تراجع" under it
export default function DeactivateSheetActions({
  primaryLabel,
  primaryTestID,
  onPrimary,
  primaryDisabled = false,
  isLoading = false,
  cancelTestID,
  onCancel,
  className = 'w-full gap-2 pt-4',
}: DeactivateSheetActionsProps) {
  const disabled = primaryDisabled || isLoading;

  return (
    <View className={className}>
      <TouchableOpacity
        testID={primaryTestID}
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityState={{ disabled }}
        onPress={onPrimary}
        className={`h-[48px] w-full flex-row items-center justify-center rounded-[24px] bg-[#B97500] ${
          disabled ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] text-white">
            {primaryLabel}
          </Text>
        )}
      </TouchableOpacity>

      {onCancel && (
        <TouchableOpacity
          testID={cancelTestID}
          activeOpacity={0.8}
          onPress={onCancel}
          className="h-[48px] w-full items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
        >
          <Text className="font-cairo-semibold text-[14px] text-[#111111]">
            تراجع
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
