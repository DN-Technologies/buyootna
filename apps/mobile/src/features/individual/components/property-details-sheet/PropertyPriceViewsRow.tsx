import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { formatTimeAgo } from '@/shared/utils/helpers/property';
import { formatNumber } from '@/shared/utils/formatNumber';

interface PropertyPriceViewsRowProps {
  price: number;
  createdAt: string;
  views: number;
}

export default function PropertyPriceViewsRow({
  price,
  createdAt,
  views,
}: PropertyPriceViewsRowProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      {/* Price */}
      <View className="items-start">
        {price > 0 ? (
          <Text className="font-cairo-bold text-2xl text-[#15304D]">
            {formatNumber(price)}{' '}
            <Text className="font-cairo text-sm text-[#6B6A6A]">
              د.ك
            </Text>
          </Text>
        ) : (
          <Text className="font-cairo-bold text-xl text-[#15304D]">
            السعر غير معلن
          </Text>
        )}
      </View>

      {/* Views & Time */}
      <View className="flex-row items-center gap-1.5">
        <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
          {formatTimeAgo(createdAt)} -
        </Text>
        <View className="flex-row items-center gap-1">
          <Feather name="eye" size={14} color="#6B6A6A" />
          <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
            {views || 0}
          </Text>
        </View>
      </View>
    </View>
  );
}
