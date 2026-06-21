import { Feather } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '@/hooks/useMyActivity';

interface ActiveAdCardProps {
  property: ActivityItem;
  onOptionsPress: () => void;
}

export default function ActiveAdCard({
  property,
  onOptionsPress,
}: ActiveAdCardProps) {
  // Use a fallback image if none exists
  const coverImage =
    property.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/40">
      {/* --- Image Header & Badges --- */}
      <View className="relative h-44 w-full">
        <Image
          source={{ uri: coverImage }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Green "Active" Badge */}
        <View className="absolute left-3 top-3 rounded-md bg-[#22C55E] px-3 py-1">
          <Text className="font-cairo-bold text-[11px] text-white">نشط</Text>
        </View>

        {/* Optional: Premium Ad Badge (If it was purchased) */}
        {property.isPremium && (
          <View className="absolute right-3 top-3 rounded-md bg-[#F99F38] px-3 py-1">
            <Text className="font-cairo-bold text-[11px] text-white">
              التميز نشط حتى 25 مايو
            </Text>
          </View>
        )}
      </View>

      {/* --- Content Body --- */}
      <View className="p-4">
        {/* Title, Price & 3-Dot Menu */}
        <View className="mb-2 flex-row items-start justify-between">
          <TouchableOpacity onPress={onOptionsPress} className="-ml-2 p-2">
            <Feather name="more-vertical" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View className="flex-1 items-end">
            <Text className="mb-1 font-cairo-medium text-xs text-[#64748B]">
              {property.type} {property.category}
            </Text>
            <View className="flex-row items-baseline space-x-1 space-x-reverse">
              <Text className="font-cairo-bold text-xl text-[#111111]">
                {property.price?.toLocaleString()}
              </Text>
              <Text className="font-cairo-bold text-sm text-[#111111]">
                د.ك
              </Text>
            </View>
            <Text className="mt-1 font-cairo-medium text-[10px] text-[#94A3B8]">
              تاريخ النشر 15 مايو 2026
            </Text>
          </View>
        </View>

        {/* --- Divider --- */}
        <View className="my-3 h-[1px] w-full bg-gray-100" />

        {/* --- Stats Row --- */}
        <View className="flex-row items-center justify-between px-2">
          <View className="items-center">
            <Text className="mb-1 font-cairo-medium text-[10px] text-[#94A3B8]">
              عدد المشاهدات
            </Text>
            <Text className="font-cairo-bold text-sm text-[#15304D]">50</Text>
          </View>

          <View className="h-6 w-[1px] bg-gray-200" />

          <View className="items-center">
            <Text className="mb-1 font-cairo-medium text-[10px] text-[#94A3B8]">
              مرات الحفظ
            </Text>
            <Text className="font-cairo-bold text-sm text-[#15304D]">80</Text>
          </View>

          <View className="h-6 w-[1px] bg-gray-200" />

          <View className="items-center">
            <Text className="mb-1 font-cairo-medium text-[10px] text-[#94A3B8]">
              عدد التواصل
            </Text>
            <Text className="font-cairo-bold text-sm text-[#15304D]">4</Text>
          </View>
        </View>

        {/* --- Details Expand Button --- */}
        <TouchableOpacity className="mt-4 flex-row items-center justify-center">
          <Text className="mr-1 font-cairo-bold text-xs text-[#64748B]">
            تفاصيل
          </Text>
          <Feather name="chevron-down" size={14} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
