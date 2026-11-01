import { Text, TouchableOpacity, View } from 'react-native';

import AdImageGallery from '@/features/individual/components/activity/ads/AdImageGallery';
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
  // Construct label like "شقة للبيع" or "عقار تجاري للبيع"
  const displayLabel = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;

  // Tapping the card previews the draft, like its "معاينة ونشر" button: a
  // draft isn't public, so it has no details page to open. A swipe on the
  // photos only pages through them
  return (
    <View className="mb-4 overflow-hidden rounded-md border border-gray-100 bg-[#FEFEFE] shadow-sm shadow-gray-200/30">
      {/* --- Swipeable Photos --- */}
      <AdImageGallery images={property.images} onPress={onPublishPress} />

      {/* --- Content Body --- */}
      <TouchableOpacity
        testID={`draft-ad-card-${property.id}`}
        accessibilityRole="button"
        activeOpacity={0.85}
        onPress={onPublishPress}
        className="p-4">
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
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {property.price ? formatNumber(property.price) : '---'}
            </Text>
            <Text className="font-cairo text-xs text-[#6B6A6A]">
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
      </TouchableOpacity>
    </View>
  );
}
