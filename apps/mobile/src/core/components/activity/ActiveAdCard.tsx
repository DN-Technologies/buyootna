import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { MoreIcon } from '@/assets/icons/activity';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/core/utils/helpers/property';
import { ActivityItem } from '@/hooks/useMyActivity';

interface ActiveAdCardProps {
  property: ActivityItem;
  onEditPress: (id: string) => void;
  onFeaturePress: (id: string) => void;
  onDeletePress: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '15 مايو 2026';
  }
};

export default function ActiveAdCard({
  property,
  onEditPress,
  onFeaturePress,
  onDeletePress,
}: ActiveAdCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const coverImage = property.images?.[0];
  const imageSource = coverImage
    ? { uri: coverImage }
    : require('@/assets/images/no-image.png');

  const displayLabel = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;

  return (
    <View className="z-10 mb-4 overflow-hidden rounded-md border border-[#FEFEFE] bg-[#FEFEFE] shadow-sm shadow-gray-200/30">
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
        {/* Title, Date & Options Trigger */}
        <View className="z-20 mb-1 flex-row items-center justify-between">
          {/* Right: Category Label */}
          <Text className="font-cairo-bold text-[16px] text-[#111111]">
            {displayLabel}
          </Text>

          {/* Left: 3-Dot Options Trigger */}
          <View className="relative z-50">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowMenu(!showMenu)}
              className="p-1"
            >
              <MoreIcon size={15} color="#64748B" />
            </TouchableOpacity>

            {showMenu && (
              <View className="absolute right-[-4px] top-4 z-50 mt-4 w-[196px] rounded-md bg-white shadow-md shadow-gray-200">
                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    onEditPress(property.id);
                  }}
                  className="px-4 py-3"
                >
                  <Text
                    className="font-cairo text-[14px] leading-[22px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    تعديل
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    onFeaturePress(property.id);
                  }}
                  className="px-4 py-3"
                >
                  <Text
                    className="font-cairo text-[14px] leading-[22px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    تمييز الإعلان
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    onDeletePress(property.id);
                  }}
                  className="px-4 py-3"
                >
                  <Text
                    className="font-cairo text-[14px] leading-[22px] text-[#9C1E28]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    حذف
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Price & Publication Date Row */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {property.price?.toLocaleString()}
            </Text>
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
              د.ك
            </Text>
          </View>
          <Text className="font-cairo text-xs text-[#6B6A6A]">
            تاريخ النشر: {formatDate(property.updatedAt)}
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
    </View>
  );
}
