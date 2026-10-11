import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '@/shared/hooks/useMyActivity';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  formatArabicDate,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

interface ArchivedAdCardProps {
  property: ActivityItem;
  onPress?: () => void;
}

export default function ArchivedAdCard({
  property,
  onPress,
}: ArchivedAdCardProps) {
  const coverImage = property.images?.[0];
  const imageSource = coverImage
    ? { uri: coverImage }
    : require('@/assets/images/no-image.png');

  // Construct label like "شقة سكني" or "عمارة تجاري"
  const categoryLabel = getArabicCategoryLabel(property.category);
  const typeLabel = property.type || getArabicTypeLabel(property.type as any);
  const displayLabel = `${categoryLabel} ${typeLabel}`.trim();

  const formattedExpiryDate =
    formatArabicDate(property.endDate || property.updatedAt) || '18 أغسطس 2026';

  return (
    <TouchableOpacity
      testID="archived-ad-card"
      activeOpacity={0.85}
      onPress={onPress}
      className="mb-3 w-full flex-row items-center justify-between overflow-hidden rounded-[6px] border border-[#ECECEC] bg-white"
    >
      {/* --- Right Column: Property Image & Slide Dots --- */}
      <View className="relative h-[93px] w-[113px] overflow-hidden rounded-r-[6px] bg-gray-50">
        <Image
          source={imageSource}
          // expo-image isn't a NativeWind-styled component: className would
          // be ignored and the image rendered at 0x0
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />

        {/* Slide Indicator Dots */}
        <View className="absolute bottom-2 left-0 right-0 flex-row items-center justify-center gap-1">
          <View className="h-1 w-1 rounded-full bg-white/70" />
          <View className="h-1 w-1 rounded-full bg-white/70" />
          <View className="h-1 w-3.5 rounded-full bg-[#15304D]" />
        </View>
      </View>
      {/* --- Left Column: Info (Title, Price, Expiration Date) --- */}
      <View className="flex-1 justify-center px-3 py-2.5">
        {/* Title */}
        <Text
          className="font-cairo-semibold text-[14px] leading-[22px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {displayLabel || 'عقار سكني'}
        </Text>

        {/* Price Row */}
        <View className="my-1 flex-row items-baseline gap-1">
          <Text className="font-cairo-semibold text-[22px] leading-[26px] text-[#111111]">
            {property.price ? formatNumber(property.price) : '---'}
          </Text>
          <Text className="font-cairo-semibold text-[12px] text-[#111111]">
            د.ك
          </Text>
        </View>

        {/* Expiry Date */}
        <View className="flex-row items-center gap-1">
          <Feather name="calendar" size={14} color="#6B6A6A" />
          <Text className="font-cairo-medium text-[12px] leading-[22px] text-[#6B6A6A]">
            منتهي في {formattedExpiryDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
