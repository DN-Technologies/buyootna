import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { LicenseIcon, LocationIcon } from '@/assets/icons/home/property';
import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

function SectionLabel({ children, spacing = 'mb-1.5' }: { children: ReactNode; spacing?: string }) {
  return (
    <Text
      className={`font-cairo-semibold text-xs text-[#6B6A6A] ${spacing}`}
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}

// A feature arrives as a plain string or as an object from the catalogue
const featureLabel = (feature: any): string =>
  typeof feature === 'string'
    ? feature
    : feature.label || feature.name || feature.id;

/** Location, features, the automated number and the description. */
export default function AdPreviewDetails({
  property,
}: {
  property: Pick<
    ActivityItem,
    'location' | 'features' | 'automatedNumber' | 'description'
  >;
}) {
  return (
    <>
      {/* Location row */}
      <View className="px-6 mb-4">
        <SectionLabel>الموقع</SectionLabel>
        <View className="flex-row items-center gap-1.5">
          <LocationIcon size={18} color="#15304D" />
          <Text className="font-cairo leading-[22px] text-sm text-[#111111] text-right">
            {property.location || '-'}
          </Text>
        </View>
      </View>

      {/* Features Row */}
      {property.features && property.features.length > 0 && (
        <View className="px-6 mb-4">
          <SectionLabel spacing="mb-2">مزايا العقار</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {property.features.map((feature: any, idx: number) => (
              <View
                key={idx}
                className="rounded-lg bg-[#F8FAFC] border border-gray-100 px-3 py-1"
              >
                <Text className="font-cairo text-xs leading-[22px] text-[#111111]">
                  {featureLabel(feature)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* License Badge Row */}
      {property.automatedNumber && (
        <View className="px-6 mb-4 flex-row items-center gap-1.5">
          <LicenseIcon size={16} color="#6B6A6A" />
          <Text className="font-cairo text-xs leading-[22px] text-[#6B6A6A]">
            رقم الآلي للعقار {property.automatedNumber}
          </Text>
        </View>
      )}

      {/* Description Block */}
      <View className="px-6 mb-6">
        <SectionLabel>الوصف</SectionLabel>
        <Text
          className="font-cairo text-sm leading-6 text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {property.description || '-'}
        </Text>
      </View>
    </>
  );
}
