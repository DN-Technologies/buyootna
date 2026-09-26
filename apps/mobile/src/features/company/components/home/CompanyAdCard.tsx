import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import {
  AreaIcon,
  BathIcon,
  BedIcon,
} from '@/assets/icons/home/property';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { type ActivityItem } from '@/shared/hooks/useMyActivity';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

const CARD_WIDTH = 247;
const IMAGE_HEIGHT = 163;
const BODY_OVERLAP = 18;

interface CompanyAdCardProps {
  ad: ActivityItem;
}

export default function CompanyAdCard({ ad }: CompanyAdCardProps) {
  const router = useRouter();

  const imageSource = ad.images?.[0]
    ? { uri: ad.images[0] }
    : require('@/assets/images/no-image.png');

  const title = `${getArabicCategoryLabel(ad.category)} ${getArabicTypeLabel(ad.type)}`.trim();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        width: CARD_WIDTH,
        shadowColor: '#919191',
        shadowOpacity: 0.25,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 0 },
        elevation: 1,
      }}
      className="rounded"
      onPress={() => router.push(`/property/${ad.id}`)}
    >
      {/* --- Image + overlays --- */}
      <View style={{ height: IMAGE_HEIGHT }} className="overflow-hidden rounded-[2px]">
        <Image
          source={imageSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Pagination dots (only when multiple images) */}
        {(ad.images?.length ?? 0) > 1 && (
          <View className="absolute bottom-3 left-1/2 h-1.5 -translate-x-1/2 flex-row items-center gap-1">
            <View className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <View className="h-1.5 w-1.5 rounded-full bg-white/50" />
            <View className="h-1.5 w-3.5 rounded-full bg-white" />
          </View>
        )}

        {/* "مميز" badge (top right) */}
        {ad.isPremium && (
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              right: 12,
              top: 8,
              height: 20,
              paddingHorizontal: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <Text className="font-almarai text-[12px] text-[#111111]">مميز</Text>
          </LinearGradient>
        )}
      </View>

      {/* --- Body (overlaps image bottom) --- */}
      <View
        style={{ marginTop: -BODY_OVERLAP }}
        className="items-end rounded-t-md bg-[#FEFEFE] px-3 pb-3 pt-3"
      >
        {/* Title */}
        <Text
          className="font-cairo text-[14px] leading-[21px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Price */}
        <View className="mt-1 w-full flex-row items-end justify-end">
          <Text className="font-cairo-semibold text-[22px] leading-[22px] text-[#15304D]">
            {ad.price != null ? ad.price.toLocaleString('en-US') : '—'}
          </Text>
          <Text className="ml-1 font-cairo-semibold text-[12px] leading-[18px] text-[#15304D]">
            د.ك
          </Text>
        </View>

        {/* Specs row: beds / baths / area */}
        <View className="mt-1 w-full flex-row items-center justify-end gap-5">
          {ad.beds != null && (
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo text-[14px] text-[#6B6A6A]">
                {ad.beds}
              </Text>
              <BedIcon size={16} color="#6B6A6A" />
            </View>
          )}
          {ad.baths != null && (
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo text-[14px] text-[#6B6A6A]">
                {ad.baths}
              </Text>
              <BathIcon size={16} color="#6B6A6A" />
            </View>
          )}
          {ad.areaSize != null && (
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo text-[14px] text-[#6B6A6A]">
                {ad.areaSize}
              </Text>
              <AreaIcon size={16} color="#6B6A6A" />
            </View>
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-3 h-8 w-full items-center justify-center rounded-lg bg-[#F5F7F9]"
          onPress={() => router.push(`/property/${ad.id}`)}
        >
          <Text className="font-cairo-semibold text-[14px] leading-[21px] text-[#15304D]">
            إدارة الإعلان
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
