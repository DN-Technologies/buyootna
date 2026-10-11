import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '@/shared/hooks/properties/useMyActivity';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

interface DraftAdCardProps {
  property: ActivityItem;
  onPublishPress: () => void;
  onDeletePress: () => void;
}

export default function DraftAdCard({
  property,
  onPublishPress,
  onDeletePress,
}: DraftAdCardProps) {
  const coverImage = property.images?.[0];
  const imageSource = coverImage
    ? { uri: coverImage }
    : require('@/assets/images/no-image.png');

  // Construct label like "شقة للبيع" or "عقار تجاري للبيع"
  const displayLabel = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;

  // Tapping the card previews the draft, like its "معاينة ونشر" button: a
  // draft isn't public, so it has no details page to open
  return (
    <TouchableOpacity
      testID={`draft-ad-card-${property.id}`}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPublishPress}
      className="mb-4 overflow-hidden rounded-md border border-gray-100 bg-[#FEFEFE] shadow-sm shadow-gray-200/30">
      {/* --- Image Header & Pagination Dots --- */}
      <View className="relative h-[210px] w-full bg-gray-50">
        <Image
          source={imageSource}
          // expo-image isn't a NativeWind-styled component: className would
          // be ignored and the image rendered at 0x0
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />

        {/* Pagination Dots */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-4 rounded-full bg-[#15304D]" />
        </View>
      </View>

      {/* --- Content Body --- */}
      <View className="p-4">
        {/* Title & Last Updated Row */}
        <View className="mb-1 flex-row items-center justify-between">
   

          {/* Right: Display label (e.g. شقة للبيع) */}
          <Text className="font-cairo-bold text-[16px] text-[#111111]">
            {displayLabel}
          </Text>

                 {/* Left: Last updated time */}
          <Text className="font-cairo text-xs text-[#6B6A6A]">
            آخر تحديث: {formatTimeAgo(property.updatedAt)}
          </Text>
        </View>

        {/* Price Row */}
        <View className="mb-4 flex-row items-center">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-bold text-lg text-[#111111]">
              {property.price ? formatNumber(property.price) : '---'}
            </Text>
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
              د.ك
            </Text>
          </View>
        </View>

        {/* --- Action Buttons (Side-by-Side Pill shape) --- */}
        <View className="flex-row items-center gap-3">
          {/* Primary Publish Button (Right side, takes ~70% width) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPublishPress}
            className="h-[40px] flex-[3] items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-semibold leading-[22px] text-sm text-white">
              معاينة ونشر الاعلان
            </Text>
          </TouchableOpacity>
          {/* Outline Delete Button (Left side, takes ~30% width) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDeletePress}
            className="h-[40px] flex-[3] items-center justify-center rounded-full border border-[#9C1E28] bg-white"
          >
            <Text className="font-cairo-semibold leading-[22px] text-sm text-[#9C1E28]">حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
