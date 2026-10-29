import { Feather, Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { OfficeDashboardStats } from '../../types';

interface OfficeStatsGridProps {
  stats: OfficeDashboardStats;
  onPressActiveListings?: () => void;
  onPressActiveServices?: () => void;
  onPressViews?: () => void;
  onPressNewMessages?: () => void;
}

// 700 → "700", 712 → "700+", 1234 → "1,200+": the tile shows a round figure
export function formatViews(views: number): string {
  if (views < 100) return String(views);
  const rounded = Math.floor(views / 100) * 100;
  return rounded === views
    ? rounded.toLocaleString('en-US')
    : `${rounded.toLocaleString('en-US')}+`;
}

function StatTile({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      className="flex-1 items-start gap-2 rounded-[6px] border border-[#ECECEC] bg-white px-4 py-3"
      accessibilityRole="button"
      accessibilityLabel={`${title} ${subtitle}`}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
        {icon}
      </View>
      <View className="w-full items-start gap-0.5">
        <Text
          className="font-cairo-medium text-[16px] leading-[21px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
        <Text
          className="font-cairo text-[12px] leading-[15px] text-[#15A72B]"
          style={{ writingDirection: 'rtl' }}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OfficeStatsGrid({
  stats,
  onPressActiveListings,
  onPressActiveServices,
  onPressViews,
  onPressNewMessages,
}: OfficeStatsGridProps) {
  const listingsSubtitle =
    stats.activeListingsThisWeek > 0
      ? `${stats.activeListingsThisWeek} هذا الأسبوع`
      : String(stats.activeListings);
  const messagesSubtitle =
    stats.newMessagesToday > 0 ? `${stats.newMessagesToday} اليوم` : '0';

  return (
    // RTL: each row's first tile is the right-hand one
    <View className="gap-4">
      <View className="flex-row gap-4">
        <StatTile
          title="الإعلانات النشطة"
          subtitle={listingsSubtitle}
          icon={
            <Ionicons
              name="checkmark-circle-outline"
              size={17}
              color="#15304D"
            />
          }
          onPress={onPressActiveListings}
        />
        <StatTile
          title="خدمات نشطة"
          subtitle={String(stats.activeServices)}
          icon={<Feather name="headphones" size={16} color="#15304D" />}
          onPress={onPressActiveServices}
        />
      </View>
      <View className="flex-row gap-4">
        <StatTile
          title="المشاهدات"
          subtitle={formatViews(stats.totalViews)}
          icon={<Ionicons name="eye-outline" size={16} color="#15304D" />}
          onPress={onPressViews}
        />
        <StatTile
          title="الرسائل الجديدة"
          subtitle={messagesSubtitle}
          icon={<Ionicons name="chatbox-outline" size={16} color="#15304D" />}
          onPress={onPressNewMessages}
        />
      </View>
    </View>
  );
}
