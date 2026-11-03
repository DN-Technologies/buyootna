import { Fragment } from 'react';
import { Text, View } from 'react-native';

import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

/** Views, saves and contacts, between dividers. */
export default function AdPreviewStats({
  property,
}: {
  property: Pick<ActivityItem, 'views' | 'favoritesCount' | 'chatsCount'>;
}) {
  const stats = [
    { label: 'عدد المشاهدات', value: property.views || 0 },
    { label: 'مرات الحفظ', value: property.favoritesCount ?? 0 },
    { label: 'عدد التواصل', value: property.chatsCount ?? 0 },
  ];

  return (
    <View className="mx-6 mb-6 flex-row items-center justify-around rounded-2xl bg-[#F8FAFC] border border-gray-100 py-3 px-2">
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 && <View className="h-7 w-[1px] bg-gray-200" />}
          <View className="flex-1 items-center">
            <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
              {stat.label}
            </Text>
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">
              {stat.value}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}
