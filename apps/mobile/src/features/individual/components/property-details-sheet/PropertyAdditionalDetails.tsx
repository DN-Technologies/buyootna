import { Text, View } from 'react-native';

import { LocationIcon } from '@/assets/icons/home/cards';
import { IncomeIcon, LicenseIcon } from '@/assets/icons/home/property';
import { formatNumber } from '@/shared/utils/formatNumber';

interface PropertyAdditionalDetailsProps {
  location?: string;
  // "قطعة 6، شارع …، منزل 12" from the map picker's address details
  addressLine?: string;
  propertyIncome?: number | null;
  licenseNumber?: string;
}

export default function PropertyAdditionalDetails({
  location,
  addressLine,
  propertyIncome,
  licenseNumber,
}: PropertyAdditionalDetailsProps) {
  return (
    <View className="mb-4 items-start gap-2.5">
      {/* Location */}
      {location && (
        <View className="flex-row items-start gap-2">
          <LocationIcon color="#15304D" size={18} />
          <View className="flex-1">
            <Text
              className="font-cairo-semibold text-sm leading-[20px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {location}
            </Text>
            {!!addressLine && (
              <Text
                testID="property-address-line"
                className="mt-0.5 font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {addressLine}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Income */}
      {typeof propertyIncome === 'number' && propertyIncome > 0 && (
        <View className="flex-row items-center gap-1.5">
          <IncomeIcon color="#15304D" size={18} />
          <Text className="font-cairo text-sm text-[#111111]">
            مدخول العقار:
          </Text>
          <Text className="font-cairo-bold text-base text-[#018B1B]">
            {formatNumber(propertyIncome)}
          </Text>
          <Text className="font-cairo-semibold text-xs text-[#018B1B]">
            د.ك
          </Text>
        </View>
      )}

      {/* License Number */}
      {licenseNumber && (
        <View className="flex-row items-center gap-2">
          <LicenseIcon color="#15304D" size={18} />
          <Text className="font-cairo-medium text-sm text-[#111111]">
            رقم الرخصة {licenseNumber}
          </Text>
        </View>
      )}
    </View>
  );
}
