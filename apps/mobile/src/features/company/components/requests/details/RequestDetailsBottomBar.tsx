import { Text, TouchableOpacity, View } from 'react-native';

export interface RequestDetailsBottomBarProps {
  onAcceptPress?: () => void;
  onRejectPress?: () => void;
  // Rejecting a public request hides it for this company only, so both
  // scopes can reject; kept for callers that need to hide it
  showReject?: boolean;
}

export default function RequestDetailsBottomBar({
  onAcceptPress,
  onRejectPress,
  showReject = true,
}: RequestDetailsBottomBarProps) {
  return (
    <View className="border-t border-[#ECECEC] bg-white px-4 py-3">
      {/* RTL Row: Child 0 is Visual Right (قبول - Accept), Child 1 is Visual Left (رفض - Reject) */}
      <View className="flex-row items-center justify-between gap-3">
        {/* Child 0 (Visual Right): Accept Button */}
        <TouchableOpacity
          testID="request-details-accept-button"
          onPress={onAcceptPress}
          activeOpacity={0.8}
          className="h-[48px] flex-1 items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text
            className="font-cairo-semibold text-[16px] text-white"
            style={{ writingDirection: 'rtl' }}
          >
            قبول
          </Text>
        </TouchableOpacity>

        {/* Child 1 (Visual Left): Reject Button */}
        {showReject && (
          <TouchableOpacity
            testID="request-details-reject-button"
            onPress={onRejectPress}
            activeOpacity={0.8}
            className="h-[48px] flex-1 items-center justify-center rounded-[24px] border border-[#9C1E28] bg-white"
          >
            <Text
              className="font-cairo-semibold text-[14px] text-[#9C1E28]"
              style={{ writingDirection: 'rtl' }}
            >
              رفض
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
