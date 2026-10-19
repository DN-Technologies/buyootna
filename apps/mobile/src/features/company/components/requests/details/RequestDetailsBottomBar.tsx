import { Text, TouchableOpacity, View } from 'react-native';

export interface RequestDetailsBottomBarProps {
  // pending: قبول / رفض; accepted: اصدار فاتورة / انهاء الطلب (Figma 4410:165036)
  variant?: 'pending' | 'accepted';
  onAcceptPress?: () => void;
  onRejectPress?: () => void;
  onInvoicePress?: () => void;
  onEndPress?: () => void;
  // Rejecting a public request hides it for this company only, so both
  // scopes can reject; kept for callers that need to hide it
  showReject?: boolean;
}

function BarButton({
  label,
  onPress,
  testID,
  primary,
}: {
  label: string;
  onPress?: () => void;
  testID: string;
  primary: boolean;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      className={`h-[48px] flex-1 items-center justify-center rounded-[24px] ${
        primary ? 'bg-[#15304D]' : 'border border-[#9C1E28] bg-white'
      }`}
    >
      <Text
        className={`font-cairo-semibold text-[14px] ${primary ? 'text-white' : 'text-[#9C1E28]'}`}
        style={{ writingDirection: 'rtl' }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function RequestDetailsBottomBar({
  variant = 'pending',
  onAcceptPress,
  onRejectPress,
  onInvoicePress,
  onEndPress,
  showReject = true,
}: RequestDetailsBottomBarProps) {
  return (
    <View className="border-t border-[#ECECEC] bg-white px-4 py-3">
      {/* RTL: the primary action on the visual right */}
      <View className="flex-row items-center justify-between gap-3">
        {variant === 'accepted' ? (
          <>
            <BarButton
              testID="request-details-invoice-button"
              label="اصدار فاتورة"
              onPress={onInvoicePress}
              primary
            />
            <BarButton
              testID="request-details-end-button"
              label="انهاء الطلب"
              onPress={onEndPress}
              primary={false}
            />
          </>
        ) : (
          <>
            <BarButton
              testID="request-details-accept-button"
              label="قبول"
              onPress={onAcceptPress}
              primary
            />
            {showReject && (
              <BarButton
                testID="request-details-reject-button"
                label="رفض"
                onPress={onRejectPress}
                primary={false}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}
