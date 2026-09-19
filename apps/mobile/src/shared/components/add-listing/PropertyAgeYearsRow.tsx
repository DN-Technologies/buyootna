import { Image } from 'expo-image';
import { Text, TextInput, View } from 'react-native';

import type { ListingType } from '@/shared/store/useListingStore';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface PropertyAgeYearsRowProps {
  listingType: ListingType;
  requestYear: string;
  onChangeRequestYear: (value: string) => void;
  requiredYear: string;
  onChangeRequiredYear: (value: string) => void;
  propertyAge: string;
  onChangePropertyAge: (value: string) => void;
  automatedNumber: string;
  onChangeAutomatedNumber: (value: string) => void;
}

export default function PropertyAgeYearsRow({
  listingType,
  requestYear,
  onChangeRequestYear,
  requiredYear,
  onChangeRequiredYear,
  propertyAge,
  onChangePropertyAge,
  automatedNumber,
  onChangeAutomatedNumber,
}: PropertyAgeYearsRowProps) {
  if (listingType === 'exchange') {
    return (
      <View className="mb-4 w-full flex-row gap-3" style={{ gap: 12 }}>
        {/* Request Year */}
        <View className="flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            سنة الطلب <Text className="text-red-500">*</Text>
          </Text>
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="2019"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={requestYear}
              onChangeText={(text) => onChangeRequestYear(toWesternDigits(text))}
            />
          </View>
        </View>

        {/* Desired Year */}
        <View className="flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            السنة المطلوبة <Text className="text-red-500">*</Text>
          </Text>
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="2025"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={requiredYear}
              onChangeText={(text) => onChangeRequiredYear(toWesternDigits(text))}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4 w-full flex-row gap-3" style={{ gap: 12 }}>
      {/* Property Age */}
      <View className="flex-1" style={{ flex: 1 }}>
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          عمر العقار
        </Text>
        <View
          className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="السنين"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={propertyAge}
            onChangeText={(text) => onChangePropertyAge(toWesternDigits(text))}
          />
        </View>
      </View>

      {/* Automated Number (PACI) */}
      <View className="flex-1" style={{ flex: 1 }}>
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          الرقم الالي للعقار
        </Text>
        <View
          className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="768954093"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={automatedNumber}
            onChangeText={(text) => onChangeAutomatedNumber(toWesternDigits(text))}
          />
          <Image
            source={require('@/assets/icons/add-listing/automated-number.png')}
            style={{ width: 17, height: 16 }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}
