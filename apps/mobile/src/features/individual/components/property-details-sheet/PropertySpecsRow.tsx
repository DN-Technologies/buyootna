import { Text, View } from 'react-native';

import { BathIcon, BedIcon } from '@/assets/icons/home/cards';
import { AreaIcon, FloorIcon } from '@/assets/icons/home/property';

interface PropertySpecsRowProps {
  areaSize?: number | null;
  area: number;
  floors?: number | null;
  beds?: number | null;
  baths?: number | null;
}

export default function PropertySpecsRow({
  areaSize,
  area,
  floors,
  beds,
  baths,
}: PropertySpecsRowProps) {
  const specs = [];
  const areaValue = areaSize || area;

  if (areaValue) {
    specs.push(
      <View key="area" className="flex-row items-center gap-1.5">
        <AreaIcon color="#15304D" size={17} />
        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
          {areaValue} م²
        </Text>
      </View>,
    );
  }
  if (floors !== undefined && floors !== null) {
    specs.push(
      <View key="floors" className="flex-row items-center gap-1.5">
        <FloorIcon color="#15304D" size={16} />
        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
          {floors} دور
        </Text>
      </View>,
    );
  }
  if (beds != null && beds > 0) {
    specs.push(
      <View key="beds" className="flex-row items-center gap-1.5">
        <BedIcon color="#15304D" size={16} />
        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
          {beds} غرفة
        </Text>
      </View>,
    );
  }
  if (baths != null && baths > 0) {
    specs.push(
      <View key="baths" className="flex-row items-center gap-1.5">
        <BathIcon color="#15304D" size={16} />
        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
          {baths} حمام
        </Text>
      </View>,
    );
  }

  return (
    <View className="mb-4 flex-row items-center justify-between px-1 py-2">
      {specs.reduce((acc, spec, index) => {
        if (index === 0) return [spec];
        return [
          ...acc,
          <View key={`divider-${index}`} className="h-4 w-[1px] bg-gray-200" />,
          spec,
        ];
      }, [] as React.ReactNode[])}
    </View>
  );
}
