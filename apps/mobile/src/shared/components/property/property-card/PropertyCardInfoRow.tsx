import { Text, View } from 'react-native';

import { LocationIcon } from '@/assets/icons/home/cards';
import { AreaIcon } from '@/assets/icons/home/property';
import { HomeIcon, PropertiesTabIcon } from '@/assets/icons/tab';

interface PropertyCardInfoRowProps {
  categoryLabel: string;
  location: string;
  area: number;
}

export default function PropertyCardInfoRow({
  categoryLabel,
  location,
  area,
}: PropertyCardInfoRowProps) {
  const isHouseOrVilla =
    categoryLabel.includes('بيت') || categoryLabel.includes('فيلا');

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-row items-center gap-1.5 rounded-lg border border-gray-100/60 bg-[#F1F5F9] px-2.5 py-1">
        {isHouseOrVilla ? (
          <HomeIcon color="#15304D" size={13} />
        ) : (
          <PropertiesTabIcon color="#15304D" size={13} />
        )}
        <Text className="font-cairo-semibold text-xs leading-[16px] text-[#15304D]">
          {categoryLabel}
        </Text>
      </View>

      <View className="flex-1 flex-row items-center justify-center gap-1 px-1">
        <LocationIcon color="#6B6A6A" size={14} />
        <Text
          className="font-cairo-medium text-xs leading-[18px] text-[#111111]"
          numberOfLines={1}
        >
          {location}
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <AreaIcon color="#6B6A6A" size={14} />
        <Text className="font-cairo-medium text-xs leading-[18px] text-[#111111]">
          {area} م²
        </Text>
      </View>
    </View>
  );
}
