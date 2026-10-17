import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { formatNumber } from '@/shared/utils/formatNumber';

interface PropertyCardPriceRowProps {
  price: number | string;
  timeAgo: string;
  // Shown instead of «السعر غير معلن» when there's no price
  noPriceContent?: ReactNode;
}

export default function PropertyCardPriceRow({
  price,
  timeAgo,
  noPriceContent,
}: PropertyCardPriceRowProps) {
  const hasPrice = Number(price) > 0;
  const formattedPrice =
    typeof price === 'string' && isNaN(Number(price))
      ? price
      : formatNumber(Number(price));

  return (
    <View className="mb-2 flex-row items-baseline justify-between gap-2">
      {hasPrice ? (
        <View className="flex-row items-baseline gap-1">
          <Text className="font-cairo-bold text-2xl text-[#15304D]">
            {formattedPrice}
          </Text>
          <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
            د.ك
          </Text>
        </View>
      ) : noPriceContent ? (
        <View className="min-w-0 flex-1">{noPriceContent}</View>
      ) : (
        <Text className="font-cairo-semibold text-lg leading-[22px] text-[#15304D]">
          السعر غير معلن
        </Text>
      )}

      <Text className="font-cairo text-xs text-[#8E8E93]">{timeAgo}</Text>
    </View>
  );
}
