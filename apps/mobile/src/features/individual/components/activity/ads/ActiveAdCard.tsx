import { Image, Text, TouchableOpacity, View } from 'react-native';

import { formatAdDate } from '@/features/individual/components/activity/ads/formatAdDate';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { ActivityItem } from '@/shared/hooks/useMyActivity';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
  publishedDate,
} from '@/shared/utils/helpers/property';

interface ActiveAdCardProps {
  property: ActivityItem;
  // Opens the ad's details sheet
  onPress?: () => void;
}

export default function ActiveAdCard({
  property,
  onPress,
}: ActiveAdCardProps) {
  const coverImage = property.images?.[0];
  const imageSource = coverImage
    ? { uri: coverImage }
    : require('@/assets/images/no-image.png');

  const displayLabel = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;

  // The whole card opens the ad's details sheet (edit / feature / delete live
  // there)
  return (
    <TouchableOpacity
      testID={`active-ad-card-${property.id}`}
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      className="z-10 mb-4 overflow-hidden rounded-md border border-[#FEFEFE] bg-[#FEFEFE] shadow-sm shadow-gray-200/30">
      {/* --- Image Header & Badges --- */}
      <View className="relative h-[210px] w-full bg-gray-50">
        <Image
          source={imageSource}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Green "Active" Badge with Linear Gradient (Matches Figma colors and corner geometry) */}
        {!property.isPremium && !property.isHidden && (
          <LinearGradient
            colors={['#AADB53', '#33D679']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              right: 16,
              top: 16,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 0,
              paddingVertical: 5,
              paddingHorizontal: 12,
              shadowColor: '#33D679',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="font-almarai text-[12px] text-[#111111]">نشط</Text>
          </LinearGradient>
        )}

        {/* Optional: Premium Ad Badge */}
        {property.isPremium && (
          <View className="absolute left-4 top-4 rounded-lg bg-[#FA9E1B] px-3 py-1.5 shadow-sm">
            <Text className="font-cairo-bold text-[11px] text-[#111111]">
              إعلان مميز
            </Text>
          </View>
        )}

        {/* Optional: Hidden Ad Badge */}
        {property.isHidden && (
          <View className="absolute left-4 top-4 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <Text className="font-cairo-bold text-[11px] text-[#111111]">
              اعلان مخفي
            </Text>
          </View>
        )}

        {/* Pagination Dots  */}
        <View className="absolute bottom-4 left-0 right-0 flex-row items-center justify-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-4 rounded-full bg-[#15304D]" />
        </View>
      </View>

      {/* --- Content Body --- */}
      <View className="relative p-4">
        {/* Category label */}
        <View className="mb-1">
          <Text className="font-cairo-bold text-[16px] text-[#111111]">
            {displayLabel}
          </Text>
        </View>

        {/* Price & Publication Date Row */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {formatNumber(property.price ?? 0)}
            </Text>
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
              د.ك
            </Text>
          </View>
          <Text className="font-cairo text-xs text-[#6B6A6A]">
            تاريخ النشر: {formatAdDate(publishedDate(property) ?? property.updatedAt)}
          </Text>
        </View>

        {/* --- Stats Container Box (From Figma design) --- */}
        <View className="z-10 flex-row items-center justify-around rounded-2xl border border-gray-100/50 bg-[#F8FAFC] px-2 py-3">
          {/* Column 1: Views (Renders on far right in RTL) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              عدد المشاهدات
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">
              {property.views || 0}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-7 w-[1px] bg-gray-200/50" />

          {/* Column 2: Saves (Renders in middle) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              مرات الحفظ
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">
              80
            </Text>
          </View>

          {/* Divider */}
          <View className="h-7 w-[1px] bg-gray-200/50" />

          {/* Column 3: Contacts (Renders on far left in RTL) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              عدد التواصل
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">
              4
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
