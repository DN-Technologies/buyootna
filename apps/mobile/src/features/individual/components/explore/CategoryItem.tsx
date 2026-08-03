import { Text, TouchableOpacity, View } from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/SafeLinearGradient';

export interface CategoryItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  isSoon?: boolean;
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
  searchTab?: 'properties' | 'companies';
  searchFilters?: Record<string, any>;
}

export default function CategoryItem({
  icon: Icon,
  title,
  isSoon = false,
  onPress,
  iconColor = '#15304D',
  iconSize = 28,
}: CategoryItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mb-4 w-[80px] items-center"
    >
      {/* Circle wrapper */}
      <View className="relative h-[64px] w-[64px] items-center justify-center rounded-full bg-[#F5F7F9] shadow-sm shadow-gray-200/40">
        <Icon color={iconColor} size={iconSize} />

        {/* Optional 'Soon' Badge */}
        {isSoon && (
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 46,
              height: 20,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              bottom: -2,
            }}
          >
            <Text className="font-almarai text-[12px] leading-[12px] text-black">
              قريباً
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Label */}
      <Text
        className="mt-2 text-center font-cairo-medium text-[12px] leading-[18px] text-[#111111]"
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
