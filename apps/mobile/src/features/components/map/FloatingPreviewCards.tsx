import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

// --- 1. Property Preview Card ---
export function PropertyPreviewCard({
  property,
  onClose,
}: {
  property: any;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/property/${property.id}`)}
      className="mx-5 flex-row items-center justify-end rounded-2xl border border-gray-100 bg-white p-3 shadow-lg shadow-gray-400/30"
    >
      {/* Left Side: Details & Actions */}
      <View className="mr-3 h-28 flex-1 items-end justify-between py-1">
        {/* Top Row: Price & Favorite */}
        <View className="w-full flex-row items-start justify-between">
          <TouchableOpacity onPress={onClose} className="p-1">
            <Feather name="heart" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View className="flex-row items-baseline space-x-1 space-x-reverse">
            <Text className="font-cairo-bold text-lg text-[#15304D]">
              150,000
            </Text>
            <Text className="font-cairo-bold text-xs text-[#15304D]">د.ك</Text>
          </View>
        </View>

        {/* Middle: Title & Specs */}
        <View className="mt-1 w-full items-end">
          <Text className="mb-1 font-cairo-medium text-xs text-[#64748B]">
            شركة يعقوب عبد العقارية
          </Text>
          <Text className="font-cairo-bold text-[11px] text-[#111111]">
            شقة للبيع • 200 م • 3 سرير • 2 حمام
          </Text>
        </View>

        {/* Bottom Row: Location */}
        <View className="mt-1 w-full flex-row items-center justify-end">
          <Text
            className="mr-1 font-cairo-medium text-[10px] text-[#94A3B8]"
            numberOfLines={1}
          >
            السالمية، شارع 2، بناية 10، شقة 4
          </Text>
          <Feather name="map-pin" size={10} color="#94A3B8" />
        </View>
      </View>

      {/* Right Side: Image (RTL layout) */}
      <View className="relative h-28 w-28 overflow-hidden rounded-xl">
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {/* Featured Badge */}
        <View className="absolute right-2 top-2 rounded bg-[#F99F38] px-2 py-0.5">
          <Text className="font-cairo-bold text-[9px] text-white">مميز</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
