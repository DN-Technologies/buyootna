import { Text, View } from 'react-native';

import { formatNumber } from '@/shared/utils/formatNumber';

/** The price (or "---") and when the ad went up. */
export default function AdPreviewPriceRow({
  price,
  date,
}: {
  price: number | null;
  date: string;
}) {
  return (
    <View className="px-6 flex-row items-center justify-between mb-4">
      <View className="flex-row items-baseline gap-1">
        <Text className="font-cairo-bold text-2xl text-[#15304D]">
          {price ? formatNumber(price) : '---'}
        </Text>
        <Text className="font-cairo text-sm text-[#6B6A6A]">د.ك</Text>
      </View>
      <Text className="font-cairo text-xs text-[#6B6A6A]">
        تاريخ النشر: {date}
      </Text>
    </View>
  );
}
