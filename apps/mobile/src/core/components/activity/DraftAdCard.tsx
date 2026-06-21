import { Image, Text, TouchableOpacity, View } from 'react-native';

import { ActivityItem } from '@/hooks/useMyActivity';

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
  const coverImage =
    property.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/40">
      {/* --- Image Header --- */}
      <View className="relative h-40 w-full">
        <Image
          source={{ uri: coverImage }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {/* Semi-transparent overlay to indicate it's not live yet */}
        <View className="absolute inset-0 bg-black/10" />
      </View>

      {/* --- Content Body --- */}
      <View className="p-4">
        {/* Title & Price */}
        <View className="mb-4 items-end">
          <Text className="mb-1 font-cairo-medium text-xs text-[#64748B]">
            {property.type} {property.category} (مسودة)
          </Text>
          <View className="flex-row items-baseline space-x-1 space-x-reverse">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {property.price ? property.price.toLocaleString() : '---'}
            </Text>
            <Text className="font-cairo-bold text-xs text-[#111111]">د.ك</Text>
          </View>
          <Text className="mt-1 font-cairo-medium text-[10px] text-[#94A3B8]">
            آخر تحديث منذ ساعتين
          </Text>
        </View>

        {/* --- Action Buttons --- */}
        <View className="flex-col space-y-3">
          {/* Primary Publish Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPublishPress}
            className="w-full items-center justify-center rounded-xl bg-[#15304D] py-3"
          >
            <Text className="font-cairo-bold text-sm text-white">
              معاينة ونشر الاعلان
            </Text>
          </TouchableOpacity>

          {/* Outline Delete Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDeletePress}
            className="w-full items-center justify-center rounded-xl border border-[#EF4444] bg-white py-3"
          >
            <Text className="font-cairo-bold text-sm text-[#EF4444]">حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
