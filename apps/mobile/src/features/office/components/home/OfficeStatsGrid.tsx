import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeStats } from '../../types';

interface OfficeStatsGridProps {
  stats: OfficeStats;
  onPressActiveListings?: () => void;
  onPressActiveServices?: () => void;
  onPressViews?: () => void;
  onPressNewMessages?: () => void;
}

export default function OfficeStatsGrid({
  stats,
  onPressActiveListings,
  onPressActiveServices,
  onPressViews,
  onPressNewMessages,
}: OfficeStatsGridProps) {
  const router = useRouter();

  const handleActiveListings =
    onPressActiveListings ||
    (() => router.push('/(office)/office-properties'));
  const handleActiveServices =
    onPressActiveServices ||
    (() => router.push('/(office)/office-properties'));
  const handleNewMessages =
    onPressNewMessages || (() => router.push('/(office)/office-chats'));

  return (
    <View className="gap-3">
      {/* Row 1: Active Services (Left) & Active Listings (Right) */}
      <View className="flex-row gap-3">
        {/* Active Listings */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleActiveListings}
          className="flex-1 justify-between rounded-[6px] border border-[#ECECEC] bg-white p-3 min-h-[96px]"
          accessibilityRole="button"
          accessibilityLabel="الإعلانات النشطة"
        >
          <View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#15304D"
              />
            </View>
          </View>
          <View className="gap-1">
            <Text
              className="font-cairo-semibold text-[14px] leading-[18px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {stats.activeListings}
            </Text>
            <Text
              className="font-cairo-medium text-[12px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الإعلانات النشطة
            </Text>
          </View>
        </TouchableOpacity>

        {/* Active Services */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleActiveServices}
          className="flex-1 justify-between rounded-[6px] border border-[#ECECEC] bg-white p-3 min-h-[96px]"
          accessibilityRole="button"
          accessibilityLabel="خدمات نشطة"
        >
          <View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Feather name="headphones" size={16} color="#15304D" />
            </View>
          </View>
          <View className="gap-1">
            <Text
              className="font-cairo-semibold text-[14px] leading-[18px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {stats.activeServicesSubtitle || stats.activeServices}
            </Text>
            <Text
              className="font-cairo-medium text-[12px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              خدمات نشطة
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 2: New Messages (Left) & Views (Right) */}
      <View className="flex-row gap-3">
        {/* Views */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressViews}
          className="flex-1 justify-between rounded-[6px] border border-[#ECECEC] bg-white p-3 min-h-[96px]"
          accessibilityRole="button"
          accessibilityLabel="المشاهدات"
        >
          <View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons name="eye-outline" size={16} color="#15304D" />
            </View>
          </View>
          <View className="gap-1">
            <Text
              className="font-cairo-semibold text-[14px] leading-[18px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {stats.viewsSubtitle || stats.views}
            </Text>
            <Text
              className="font-cairo-medium text-[12px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              المشاهدات
            </Text>
          </View>
        </TouchableOpacity>

        {/* New Messages */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNewMessages}
          className="flex-1 justify-between rounded-[6px] border border-[#ECECEC] bg-white p-3 min-h-[96px]"
          accessibilityRole="button"
          accessibilityLabel="الرسائل الجديدة"
        >
          <View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons
                name="chatbox-outline"
                size={16}
                color="#15304D"
              />
            </View>
          </View>
          <View className="gap-1">
            <Text
              className="font-cairo-semibold text-[14px] leading-[18px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {stats.newMessages}
            </Text>
            <Text
              className="font-cairo-medium text-[12px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الرسائل الجديدة
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
