import { Text, View } from 'react-native';

import { LocationIcon } from '@/assets/icons/home/cards';
import { IncomeIcon, LicenseIcon } from '@/assets/icons/home/property';

interface PropertyAdditionalDetailsProps {
  location?: string;
  propertyIncome?: number | null;
  licenseNumber?: string;
}

export default function PropertyAdditionalDetails({
  location,
  propertyIncome,
  licenseNumber,
}: PropertyAdditionalDetailsProps) {
  return (
    <View className="mb-4 items-start gap-2.5">
      {/* Location */}
      {location && (
        <View className="flex-row items-start gap-2">
          <LocationIcon color="#15304D" size={18} />
          <Text
            className="flex-1 font-cairo-semibold text-sm leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {location}
          </Text>
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
            {propertyIncome.toLocaleString()}
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
