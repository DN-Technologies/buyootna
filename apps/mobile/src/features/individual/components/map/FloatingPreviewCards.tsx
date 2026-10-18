import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  BathIcon,
  BedIcon,
  HeartIcon,
  LocationIcon,
} from '@/assets/icons/home/cards';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

// --- 1. Property Preview Card ---
export function PropertyPreviewCard({
  property,
  onClose,
}: {
  property: any;
  onClose: () => void;
}) {
  const router = useRouter();

  const typeLabel =
    property.type === 'rent'
      ? 'شقة للايجار'
      : property.type === 'exchange'
        ? 'شقة للبدل'
        : 'شقة للبيع';

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/property/${property.id}`)}
      className="mx-5 min-h-[126px] flex-row items-center justify-between rounded-sm bg-white shadow-lg shadow-gray-400/30"
    >
      {/* Right Side: Image with Featured Badge */}
      <View className="relative h-[126px] w-[117px] overflow-hidden">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300',
          }}
          className="h-full w-full"
          contentFit="cover"
        />
        {/* Featured Badge */}
        <LinearGradient
          colors={['#FF8D28', '#FACC15']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="absolute left-2 top-2 rounded-lg px-2.5 py-0.5 shadow-sm"
        >
          <Text className="font-cairo-bold text-[9px] text-[#111111]">مميز</Text>
        </LinearGradient>
      </View>

      {/* Left Side: Details & Actions */}
      <View className="mx-3 flex-1 items-start justify-between">
        {/* Top Row: Price & Favorite */}
        <View className="w-full flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-cairo-bold text-[22px] text-[#15304D]">
              {property.priceLabel
                ? property.priceLabel.replace(' د.ك', '')
                : '150,000'}
            </Text>
            <Text className="font-cairo text-xs text-[#6B6A6A]">د.ك</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <HeartIcon color="#15304D" size={20} />
          </TouchableOpacity>
        </View>

        {/* Middle 1: Company Name */}
        <Text
          className="mb-1 w-full font-cairo text-[12px] text-[#111]"
          style={{ writingDirection: 'rtl' }}
        >
          {property.companyName ?? 'شركة يعقوب عبد العقارية'}
        </Text>

        {/* Middle 2: Specs with Custom Icons (Styled like PropertyCard.tsx) */}
        <View className="my-1.5 w-full flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Text className="font-cairo-semibold text-sm text-[#111111]">
              {typeLabel} •
            </Text>
            <Text className="font-cairo-semibold text-sm text-[#111111]">
              {property.area ?? 200} م²
            </Text>
          </View>

          {/* Land and farms have no rooms or baths */}
          {property.beds != null && (
            <>
              <View className="h-3 w-[1px] bg-[#111111]" />
              <View className="flex-row items-center gap-1.5">
                <BedIcon color="#111111" size={16} />
                <Text className="text-sm font-normal text-[#111111]">
                  {property.beds}
                </Text>
              </View>
            </>
          )}

          {property.baths != null && (
            <>
              <View className="h-3 w-[1px] bg-[#111111]" />
              <View className="flex-row items-center gap-1.5">
                <BathIcon color="#111111" size={16} />
                <Text className="text-sm font-normal text-[#111111]">
                  {property.baths}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Bottom Row: Location (Styled like PropertyCard.tsx) */}
        <View className="w-full flex-row items-center gap-1.5">
          <LocationIcon color="#6B6A6A" size={16} />
          <Text
            className="font-cairo-medium text-sm leading-[23px] text-[#6B6A6A]"
            numberOfLines={1}
          >
            {property.location ?? 'السالمية، شارع 2، بناية 10، شقة 4'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
