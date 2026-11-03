import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { OfficeDashboard } from '@/features/office/types';

import { compactCount } from '../officeProperties';

function Tile({
  title,
  value,
  icon,
  small = false,
  testID,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  // «إجمالي المشاهدات» is 12px regular in Figma
  small?: boolean;
  testID: string;
}) {
  return (
    <View
      testID={testID}
      className="flex-1 items-start rounded-[6px] bg-[#F9FAFE] px-4 py-3"
      style={{ gap: 8 }}
    >
      <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
        {icon}
      </View>
      <View className="w-full items-start" style={{ gap: 8 }}>
        <Text
          className="font-cairo-medium text-[14px] leading-[18px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
        <Text
          testID={`${testID}-value`}
          className={
            small
              ? 'font-cairo text-[12px] leading-[15px] text-[#15A72B]'
              : 'font-cairo-semibold text-[14px] leading-[18px] text-[#15A72B]'
          }
          style={{ writingDirection: 'rtl' }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const icon = (source: number, size: number) => (
  <Image source={source} style={{ width: size, height: size }} />
);

/** The four tiles on «عقارات المكتب» (Figma 4494:145520). */
export default function OfficePropertyStats({
  dashboard,
}: {
  dashboard?: OfficeDashboard;
}) {
  const stats = dashboard?.stats;
  const billing = dashboard?.billing;
  const thisWeek = stats?.activeListingsThisWeek ?? 0;
  const remaining = (billing?.adsRemaining ?? 0) + (billing?.freeAdsRemaining ?? 0);
  const total = (billing?.adsTotal ?? 0) + (billing?.freeAdsRemaining ?? 0);

  return (
    // RTL: each row's first tile is the right-hand one
    <View className="px-4" style={{ gap: 16 }}>
      <View className="flex-row" style={{ gap: 16 }}>
        <Tile
          testID="office-stat-active"
          title="الإعلانات النشطة"
          value={
            thisWeek > 0
              ? `${thisWeek} هذا الأسبوع`
              : String(stats?.activeListings ?? 0)
          }
          icon={icon(require('@/assets/icons/office-properties/stat-check.svg'), 16)}
        />
        <Tile
          testID="office-stat-closed"
          title="العقارات المباعة"
          value={String(stats?.closedListings ?? 0)}
          icon={icon(require('@/assets/icons/office-properties/stat-building.svg'), 20)}
        />
      </View>
      <View className="flex-row" style={{ gap: 16 }}>
        <Tile
          testID="office-stat-balance"
          title="رصيد الإعلانات"
          value={total > 0 ? `${remaining} من اصل ${total}` : String(remaining)}
          icon={icon(require('@/assets/icons/office-properties/stat-ad-free.svg'), 19.2)}
        />
        <Tile
          testID="office-stat-views"
          title="إجمالي المشاهدات"
          value={compactCount(stats?.totalViews ?? 0)}
          small
          icon={icon(require('@/assets/icons/office-properties/stat-eye.svg'), 20)}
        />
      </View>
    </View>
  );
}
