import { Fragment, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import {
  AreaIcon,
  BathIcon,
  BedIcon,
  FloorIcon,
} from '@/assets/icons/home/property';
import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

const ICON = { size: 16, color: '#6B6A6A' };

// "-" when the ad doesn't say
const withUnit = (value: number | null | undefined, unit: string) =>
  value !== undefined && value !== null ? `${value} ${unit}` : '-';

function Spec({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <View className="flex-1 flex-row items-center justify-center gap-1.5">
      {icon}
      <Text className="font-cairo leading-[22px] text-sm text-[#111111]">
        {value}
      </Text>
    </View>
  );
}

/** Area, floors, bedrooms and bathrooms, between dividers. */
export default function AdPreviewSpecs({
  property,
}: {
  property: Pick<ActivityItem, 'areaSize' | 'floors' | 'beds' | 'baths'>;
}) {
  const specs = [
    {
      key: 'area',
      icon: <AreaIcon {...ICON} />,
      // No area (or 0) shows "-"
      value: property.areaSize ? `${property.areaSize} م²` : '-',
    },
    { key: 'floors', icon: <FloorIcon {...ICON} />, value: withUnit(property.floors, 'دور') },
    { key: 'beds', icon: <BedIcon {...ICON} />, value: withUnit(property.beds, 'غرف') },
    { key: 'baths', icon: <BathIcon {...ICON} />, value: withUnit(property.baths, 'حمام') },
  ];

  return (
    <View className="px-6 flex-row items-center justify-between py-3 border-y border-gray-100 mb-4">
      {specs.map((spec, index) => (
        <Fragment key={spec.key}>
          {index > 0 && <View className="h-4 w-[1px] bg-gray-200" />}
          <Spec icon={spec.icon} value={spec.value} />
        </Fragment>
      ))}
    </View>
  );
}
