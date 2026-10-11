import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AlertsListHeaderProps {
  allPaused: boolean;
  onToggleAll: () => void;
}

function BellOffIcon({ size = 16, color = '#15304D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BellOnIcon({ size = 16, color = '#15304D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function AlertsListHeader({
  allPaused,
  onToggleAll,
}: AlertsListHeaderProps) {
  const label = allPaused ? 'تفعيل جميع التنبيهات' : 'ايقاف جميع التنبيهات';

  return (
    <View className="mb-3 w-full">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleAll}
        testID="toggle-all-alerts-btn"
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-[40px] w-full flex-row items-center justify-center gap-2 rounded-full border border-[#15304D] bg-white px-4"
      >
        {allPaused ? (
          <BellOnIcon size={16} color="#15304D" />
        ) : (
          <BellOffIcon size={16} color="#15304D" />
        )}
        <Text className="font-cairo-semibold leading-[22px] text-sm text-[#15304D]">
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
