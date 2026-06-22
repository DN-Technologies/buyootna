import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text,  View } from 'react-native';

import {
  getArabicCategoryLabel,
} from '@/core/utils/helpers/property';
import { ActivityItem } from '@/hooks/useMyActivity';

interface ActiveAdCardProps {
  property: ActivityItem;
  onOptionsPress: () => void;
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
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
  onOptionsPress,
}: ActiveAdCardProps) {
  // Use a fallback image if none exists
  const coverImage =
    property.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm shadow-gray-200/30">
      {/* --- Image Header & Badges --- */}
      <View className="relative h-[210px] w-full bg-gray-50">
        <Image
          source={{ uri: coverImage }}
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
              التميز نشط حتى 25 مايو
            </Text>
          </View>
        )}

        {/* Optional: Hidden Ad Badge */}
        {property.isHidden && (
          <View className="absolute left-4 top-4 rounded-lg bg-white border border-gray-200 px-3 py-1.5 shadow-sm">
            <Text className="font-cairo-bold text-[11px] text-[#111111]">
              اعلان مخفي
            </Text>
          </View>
        )}

        {/* Pagination Dots  */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <View className="h-1.5 w-4 rounded-full bg-[#15304D]" />
        </View>
      </View>

      {/* --- Content Body --- */}
      <View className="p-4">
        {/* Title, Date & Options Trigger */}
        <View className="mb-1 flex-row items-center justify-between">


          {/* Right: Category Label */}
          <Text className="font-cairo-bold text-[16px] text-[#111111]">
            {getArabicCategoryLabel(property.category)}
          </Text>

          {/* Left: 3-Dot Options & Date */}
          <View className="flex-row items-center gap-1.5">
            <Text className="font-cairo text-xs text-[#6B6A6A]">
              {formatDate(property.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Price Row  */}
        <View className="mb-4 flex-row items-center ">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {property.price?.toLocaleString()}
            </Text>
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
              د.ك
            </Text>
          </View>
        </View>

        {/* --- Stats Container Box (From Figma design) --- */}
        <View className="flex-row items-center justify-around rounded-2xl bg-[#F8FAFC] border border-gray-100/50 py-3 px-2">
          {/* Column 1: Views (Renders on far right in RTL) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              عدد المشاهدات
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">50</Text>
          </View>

          {/* Divider */}
          <View className="h-7 w-[1px] bg-gray-200/50" />

          {/* Column 2: Saves (Renders in middle) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              مرات الحفظ
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">80</Text>
          </View>

          {/* Divider */}
          <View className="h-7 w-[1px] bg-gray-200/50" />

          {/* Column 3: Contacts (Renders on far left in RTL) */}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              عدد التواصل
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">4</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
