import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RequestActionBarProps {
  onAccept: () => void;
  onReject: () => void;
}

/** Bottom bar of a replied request: قبول العرض (navy) / رفض العرض. */
export default function RequestActionBar({
  onAccept,
  onReject,
}: RequestActionBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-white px-3 pt-4"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        shadowColor: '#9D9D9D',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 2.45,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          testID="request-accept"
          activeOpacity={0.8}
          onPress={onAccept}
          className="h-12 flex-1 items-center justify-center rounded-[24px] bg-[#15304D] px-1"
        >
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-white"
            style={{ letterSpacing: 0.28 }}
          >
            قبول العرض
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="request-reject"
          activeOpacity={0.8}
          onPress={onReject}
          className="h-12 flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] px-5"
        >
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
            style={{ letterSpacing: 0.28 }}
          >
            رفض العرض
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
