import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { LocationIcon } from '@/assets/icons/home/cards';
import { OfficeHeaderData } from '@/shared/api/office.service';
import { openUrlThrottled } from '@/shared/utils/openUrl';

interface OfficeHeaderCardProps {
  office: OfficeHeaderData;
}

export default function OfficeHeaderCard({ office }: OfficeHeaderCardProps) {
  const handleOpenLink = (url?: string) => {
    if (url) {
      openUrlThrottled(url).catch(() => {});
    }
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* ── 1. Top Cover Banner & Overlapping Logo ── */}
      <View className="relative h-20 bg-[#15304D]">
        {office.coverUrl ? (
          <ExpoImage
            source={{ uri: office.coverUrl }}
            className="h-full w-full opacity-60"
            contentFit="cover"
          />
        ) : null}

        {/* Office Logo Badge */}
        <View className="absolute -bottom-8 left-5 h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-[#15304D] shadow-sm">
          {office.logoUrl ? (
            <ExpoImage
              source={{ uri: office.logoUrl }}
              className="h-full w-full"
              contentFit="cover"
            />
          ) : (
            <Feather name="home" size={24} color="#FFFFFF" />
          )}
        </View>
      </View>

      {/* ── 2. Office Identity Info ── */}
      <View className="px-5 pb-4 pt-10">
        <View className="flex-row items-center justify-between">
          {/* Name & Verified Badge */}
          <View className="flex-row items-center gap-1.5">
            <Text className="font-cairo-bold text-lg leading-[24px] text-[#111111]">
              {office.name}
            </Text>
            {office.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#0084FF" />
            )}
          </View>

          {/* Active Now Badge */}
          {office.isActiveNow && (
            <View className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1">
              <View className="h-2 w-2 rounded-full bg-[#22C55E]" />
              <Text className="font-cairo-medium text-xs leading-[16px] text-[#15803D]">
                نشط الآن
              </Text>
            </View>
          )}
        </View>

        {/* Rating Row */}
        <View className="mb-2 flex-row items-center gap-1.5">
          <FontAwesome name="star" size={14} color="#F59E0B" />
          <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
            {office.rating.toFixed(1)}
          </Text>
          <Text className="font-cairo-regular text-xs text-[#A0A0A0]">
            ({office.reviewsCount} تقييم)
          </Text>
        </View>

        {/* Bio / Description */}
        {office.bio && (
          <Text
            className="mb-3 font-cairo text-[14px] leading-[20px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {office.bio}
          </Text>
        )}

        {/* Location Row */}
        {office.location && (
          <View className="mb-4 flex-row items-center gap-1">
            <LocationIcon color="#15304D" size={16} />
            <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
              {office.location}
            </Text>
          </View>
        )}

        {/* ── 3. Three-Column Metrics Bar ── */}
        <View className="mb-4 flex-row items-center rounded-2xl bg-[#F8FAFC] px-2 py-3">
          {/* Column 1: Listings */}
          <View className="flex-1 items-center">
            <Text className="font-cairo-bold text-base text-[#111111]">
              {office.listingsCount}
            </Text>
            <Text className="font-cairo-medium text-[13px] text-[#A0A0A0]">
              الإعلانات
            </Text>
          </View>

          <View className="h-8 w-[1px] bg-gray-200" />

          {/* Column 2: Services */}
          <View className="flex-1 items-center">
            <Text className="font-cairo-bold text-base text-[#111111]">
              {office.servicesCount}
            </Text>
            <Text className="font-cairo-medium text-[13px] text-[#A0A0A0]">
              الخدمات
            </Text>
          </View>

          {office.responseTime && (
            <>
              <View className="h-8 w-[1px] bg-gray-200" />

              {/* Column 3: Response Time */}
              <View className="flex-1 items-center">
                <Text className="font-cairo-bold text-base text-[#111111]">
                  {office.responseTime}
                </Text>
                <Text className="font-cairo-medium text-[13px] text-[#A0A0A0]">
                  سرعة الرد
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── 4. Social Media Links ── */}
        <View className="flex-row items-center gap-3">
          {office.instagramUrl ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenLink(office.instagramUrl)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0F5]"
            >
              <FontAwesome name="instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
          ) : null}

          {office.twitterUrl ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenLink(office.twitterUrl)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5F6F8]"
            >
              <Text className="font-cairo-bold text-sm text-[#111111]">𝕏</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
