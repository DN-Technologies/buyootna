import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  badgeCount?: number;
  badgeColor?: string;
  onPress: () => void;
  hideChevron?: boolean;
  compact?: boolean;
  iconSize?: number;
  chevronColor?: string;
  className?: string;
}

export default function MenuItem({
  icon: Icon,
  title,
  badgeCount,
  badgeColor = '#991B1B',
  onPress,
  hideChevron = false,
  compact = false,
  iconSize,
  chevronColor = '#94A3B8',
  className = '',
}: MenuItemProps) {
  const pyClass = compact ? 'py-2' : 'py-4';
  const defaultIconSize = compact ? 20 : 22;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-between bg-[#F9FAFE] ${pyClass} ${className}`}
    >
      {/* Right Side (Icon & Title in RTL layout or Left-Right based on flex) */}
      <View className="flex-row items-center gap-2">
        <View className="h-5 w-5 items-center justify-center">
          <Icon color="#111111" size={iconSize || defaultIconSize} />
        </View>
        <Text className="font-cairo-medium text-[14px] text-[#111111]">
          {title}
        </Text>
      </View>

      {/* Left Side (Chevron & Optional Badge) */}
      <View className="flex-row items-center gap-2.5">
        {badgeCount !== undefined && badgeCount > 0 && (
          <View
            style={{ backgroundColor: badgeColor }}
            className="h-5 w-5 items-center justify-center rounded-full"
          >
            <Text className="font-cairo-bold text-[11px] leading-[14px] text-white">
              {badgeCount}
            </Text>
          </View>
        )}
        {!hideChevron && (
          <Feather
            name="chevron-left"
            size={compact ? 14 : 18}
            color={chevronColor}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

