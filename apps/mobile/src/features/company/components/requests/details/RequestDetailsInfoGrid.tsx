import { Text, View } from 'react-native';

import { LocationPinSmallIcon, WalletSmallIcon } from '../icons';
import { DocumentOfferIcon, PublishClockIcon } from './icons';

export interface RequestDetailsInfoGridProps {
  location: string;
  priceRange?: string;
  publishTime?: string;
  offerType?: string;
}

export default function RequestDetailsInfoGrid({
  location,
  priceRange = '22,000 - 15,000 د.ك',
  publishTime = 'منذ ساعتين',
  offerType = 'عرض مخصص',
}: RequestDetailsInfoGridProps) {
  return (
    <View className="rounded-[12px] bg-[#F9FAFE] p-3.5">
      {/* Row 1 (RTL: Child 0 is Visual Right Location, Child 1 is Visual Left Budget) */}
      <View className="flex-row items-center justify-between">
        {/* Child 0 (Visual Right): Location */}
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="size-[26px] items-center justify-center rounded-full bg-[#DEE3E8]">
            <LocationPinSmallIcon size={14} color="#15304D" />
          </View>
          <View>
            <Text
              className="font-cairo-semibold text-[12px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              الموقع
            </Text>
            <Text
              testID="request-details-location-val"
              className="mt-0.5 font-cairo-semibold text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
        </View>

        {/* Child 1 (Visual Left): Budget */}
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="size-[26px] items-center justify-center rounded-full bg-[#DEE3E8]">
            <WalletSmallIcon size={14} color="#15304D" />
          </View>
          <View>
            <Text
              className="font-cairo-semibold text-[12px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              الميزانية
            </Text>
            <Text
              testID="request-details-price-val"
              className="mt-0.5 font-cairo-semibold text-[13px] text-[#111111]"
              style={{ writingDirection: 'ltr' }}
              numberOfLines={1}
            >
              {priceRange}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="my-3 h-px w-full bg-[#ECECEC]" />

      {/* Row 2 (RTL: Child 0 is Visual Right Publish Date, Child 1 is Visual Left Offers) */}
      <View className="flex-row items-center justify-between">
        {/* Child 0 (Visual Right): Publish Time */}
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="size-[26px] items-center justify-center rounded-full bg-[#DEE3E8]">
            <PublishClockIcon size={14} color="#15304D" />
          </View>
          <View>
            <Text
              className="font-cairo-semibold text-[12px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              تاريخ النشر
            </Text>
            <Text
              testID="request-details-publish-time-val"
              className="mt-0.5 font-cairo-semibold text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {publishTime}
            </Text>
          </View>
        </View>

        {/* Child 1 (Visual Left): Offer Type */}
        <View className="flex-1 flex-row items-center gap-2.5">
          <View className="size-[26px] items-center justify-center rounded-full bg-[#DEE3E8]">
            <DocumentOfferIcon size={14} color="#15304D" />
          </View>
          <View>
            <Text
              className="font-cairo-semibold text-[12px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              العروض
            </Text>
            <Text
              testID="request-details-offer-type-val"
              className="mt-0.5 font-cairo-semibold text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {offerType}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
