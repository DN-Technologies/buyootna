import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { LocationIcon } from '@/assets/icons/home/cards';
import {
  formatPresence,
  formatResponseTime,
  ResponseTime,
} from '@/shared/utils/helpers/activity';
import { openUrlThrottled } from '@/shared/utils/openUrl';

export interface CompanyHeaderData {
  id: string;
  userId?: string;
  name: string;
  logoUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  // False while the company has no active subscription; older APIs omit it
  acceptsRequests?: boolean;
  isActiveNow?: boolean;
  lastSeenAt?: string | null;
  rating: number;
  reviewsCount: number;
  bio?: string;
  location?: string;
  servicesCount: number;
  projectsCount: number;
  responseTime?: ResponseTime | null;
  instagramUrl?: string;
  twitterUrl?: string;
  phone?: string;
  whatsapp?: string;
}

interface CompanyHeaderCardProps {
  company: CompanyHeaderData;
  // Live stories: the logo gets a ring (gold while unseen) and opens them
  logoRing?: { hasUnseen: boolean; onPress: () => void } | null;
}

export default function CompanyHeaderCard({
  company,
  logoRing,
}: CompanyHeaderCardProps) {
  const activity = formatPresence({
    isOnline: !!company.isActiveNow,
    lastSeenAt: company.lastSeenAt ?? null,
  });
  const responseTime = formatResponseTime(company.responseTime);
  const handleOpenLink = (url?: string) => {
    if (url) {
      openUrlThrottled(url).catch(() => {});
    }
  };

  // White normally; gold while it has unseen stories, grey once seen
  const ring = !logoRing
    ? 'border-2 border-white'
    : logoRing.hasUnseen
      ? 'border-[3px] border-[#C99A52]'
      : 'border-[3px] border-[#C4C9CF]';

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* ── 1. Top Cover Banner & Overlapping Logo ── */}
      <View className="relative h-20 bg-[#15304D]">
        {company.coverUrl ? (
          <ExpoImage
            source={{ uri: company.coverUrl }}
            className="h-full w-full opacity-60"
            contentFit="cover"
          />
        ) : null}

        {/* Company Logo Badge */}
        <TouchableOpacity
          testID="profile-logo"
          disabled={!logoRing}
          onPress={logoRing?.onPress}
          activeOpacity={0.8}
          accessibilityRole={logoRing ? 'button' : undefined}
          accessibilityState={{ disabled: !logoRing, selected: !!logoRing?.hasUnseen }}
          accessibilityLabel={logoRing ? `قصص ${company.name}` : undefined}
          className={`absolute -bottom-8 left-5 h-16 w-16 items-center justify-center rounded-2xl ${ring} bg-[#111111] overflow-hidden shadow-sm`}
        >
          {company.logoUrl ? (
            <ExpoImage
              source={{ uri: company.logoUrl }}
              className="h-full w-full"
              contentFit="cover"
            />
          ) : (
            <Feather name="briefcase" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── 2. Company Identity Info ── */}
      <View className="px-5 pt-10 pb-4">
        <View className=' items-center justify-between flex-row'>
            {/* Name & Verified Badge */}
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo-bold text-lg leading-[24px] text-[#111111]">
                {company.name}
              </Text>
              {company.isVerified && (
                <Ionicons name="checkmark-circle" size={15} color="#0084FF" />
              )}
            </View>

              {/* Title + Online Badge Row */}
              <View className="flex-row items-center justify-end mb-1">
                {/* Activity Badge (hidden after a week of no activity) */}
                {activity && (
                  <View className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1">
                    {activity.isOnline && (
                      <View className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    )}
                    <Text
                      className={`font-cairo-medium text-xs leading-[16px] ${
                        activity.isOnline ? 'text-[#15803D]' : 'text-[#6B6A6A]'
                      }`}
                    >
                      {activity.label}
                    </Text>
                  </View>
                )}
          </View>
        </View>

        {/* Rating Row */}
        <View className="flex-row items-center gap-1.5 mb-2">
          {company.reviewsCount > 0 ? (
            <>
              <FontAwesome name="star" size={14} color="#F59E0B" />
              <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
                {company.rating.toFixed(1)}
              </Text>
              <Text className="font-cairo-regular text-xs text-[#A0A0A0]">
                ({company.reviewsCount} تقييم)
              </Text>
            </>
          ) : (
            <Text className="font-cairo-regular text-xs text-[#A0A0A0]">
              لا توجد تقييمات بعد
            </Text>
          )}
        </View>

        {/* Bio / Description */}
        {company.bio && (
          <Text className="mb-3 font-cairo text-[14px] leading-[20px] text-[#A0A0A0]"
            style={{writingDirection: "rtl"}}
          >
            {company.bio}
          </Text>
        )}

        {/* Location Row */}
        {company.location && (
          <View className="flex-row items-center gap-1 mb-4">
            <LocationIcon color="#15304D" size={16} />
            <Text className="font-cairo-medium text-xs text-[#A0A0A0]">
              {company.location}
            </Text>
          </View>
        )}

        {/* ── 3. Three-Column Metrics Bar ── */}
        <View className="mb-4 flex-row items-center rounded-2xl bg-[#F8FAFC] py-3 px-2">
          {/* Column 1: Services */}
          <View className="flex-1 items-center">
            <Text className="font-cairo-bold text-base text-[#111111]">
              {company.servicesCount}
            </Text>
            <Text className="font-cairo-medium text-[13px] text-[#A0A0A0]">
              الخدمات
            </Text>
          </View>

          <View className="h-8 w-[1px] bg-gray-200" />

          {/* Column 2: Projects / Works */}
          <View className="flex-1 items-center">
            <Text className="font-cairo-bold text-base text-[#111111]">
              {company.projectsCount}
            </Text>
            <Text className="font-cairo-medium text-[13px] text-[#A0A0A0]">
              الأعمال
            </Text>
          </View>

          {responseTime && (
            <>
              <View className="h-8 w-[1px] bg-gray-200" />

              {/* Column 3: Response Time */}
              <View className="flex-1 items-center">
                <Text className="font-cairo-bold text-base text-[#111111]">
                  {responseTime}
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
          {company.instagramUrl ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenLink(company.instagramUrl)}
              className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0F5]"
            >
              <FontAwesome name="instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
          ) : null}

          {company.twitterUrl ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenLink(company.twitterUrl)}
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
