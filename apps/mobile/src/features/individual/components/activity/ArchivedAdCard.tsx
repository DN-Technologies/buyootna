import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '@/features/individual/hooks/useMyActivity';
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
      activeOpacity={0.85}
      onPress={onPress}
      className="mb-3 w-full flex-row items-center justify-between rounded-2xl border border-gray-100/90 bg-white p-3 shadow-sm"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      }}
    >
      {/* --- Left Column: Info (Title, Price, Expiration Date) --- */}
      <View className="flex-1 justify-center pr-3">
        {/* Title */}
        <Text
          className="font-cairo-bold text-[15px] leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {displayLabel || 'عقار سكني'}
        </Text>

        {/* Price Row */}
        <View className="my-0.5 flex-row items-baseline gap-1">
          <Text className="font-cairo-bold text-lg text-[#111111]">
            {property.price ? property.price.toLocaleString() : '---'}
          </Text>
          <Text className="font-cairo-medium text-xs text-[#6B6A6A]">د.ك</Text>
        </View>

        {/* Expiry Date */}
        <View className="flex-row items-center gap-1.5">
          <Feather name="calendar" size={13} color="#6B6A6A" />
          <Text className="font-cairo text-xs text-[#6B6A6A]">
            منتهي في {formattedExpiryDate}
          </Text>
        </View>
      </View>

      {/* --- Right Column: Property Image & Slide Dots --- */}
      <View className="relative h-[95px] w-[130px] overflow-hidden rounded-xl bg-gray-50">
        <Image
          source={imageSource}
          className="h-full w-full"
          contentFit="cover"
        />

        {/* Slide Indicator Dots */}
        <View className="absolute bottom-2 left-0 right-0 flex-row items-center justify-center gap-1">
          <View className="h-1 w-1 rounded-full bg-white/70" />
          <View className="h-1 w-1 rounded-full bg-white/70" />
          <View className="h-1 w-3.5 rounded-full bg-[#15304D]" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
