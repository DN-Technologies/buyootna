import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export const SHEET_RED = '#BA0003';

interface SheetOptionRowProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  testID?: string;
  busy?: boolean;
}

/** A story sheet's option: a tinted icon tile, its title and a line on what it does. */
export default function SheetOptionRow({
  icon,
  color,
  title,
  subtitle,
  onPress,
  testID,
  busy,
}: SheetOptionRowProps) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      activeOpacity={0.6}
      disabled={busy}
      onPress={onPress}
      className="flex-row items-center px-5 py-[10px]"
      style={{ gap: 12 }}
    >
      <View
        className="size-[44px] items-center justify-center rounded-[14px]"
        style={{ backgroundColor: `${color}1A` }}
      >
        {busy ? (
          <ActivityIndicator color={color} />
        ) : (
          <Feather name={icon} size={19} color={color} />
        )}
      </View>
      <View className="flex-1 items-start">
        <Text
          className="font-cairo-semibold text-[15px] leading-[22px]"
          style={{ color: color === SHEET_RED ? SHEET_RED : '#111111' }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="font-cairo text-[12px] leading-[18px] text-[#6B6A6A]">
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
