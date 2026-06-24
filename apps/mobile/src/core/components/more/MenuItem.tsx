import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  badgeCount?: number;
  onPress: () => void;
  hideChevron?: boolean;
}

export default function MenuItem({
  icon: Icon,
  title,
  badgeCount,
  onPress,
  hideChevron = false,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between bg-[#F9FAFE] py-4"
    >
      {/* Right Side (Icon & Title) */}
      <View className="flex-row items-center gap-2">
        <Icon color="#111111" size={22} />
        <Text className="font-cairo-medium text-[14px] text-[#111111]">
          {title}
        </Text>
      </View>

      {/* Left Side (Chevron & Optional Badge) */}
      <View className="flex-row items-center gap-2">
        {badgeCount !== undefined && badgeCount > 0 && (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#991B1B]">
            <Text className="font-cairo-bold text-[11px] text-white">
              {badgeCount}
            </Text>
          </View>
        )}
        {!hideChevron && (
          <Feather name="chevron-left" size={18} color="#94A3B8" />
        )}
      </View>
    </TouchableOpacity>
  );
}
