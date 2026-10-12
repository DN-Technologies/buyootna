import { Text, View } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
import { ListingType } from '@/shared/store/useListingStore';

interface LockedAdTypeSectionProps {
  listingType: ListingType;
}

export default function LockedAdTypeSection({
  listingType,
}: LockedAdTypeSectionProps) {
  return (
    <View>
      <Text
        className="mb-4 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        نوع الإعلان
      </Text>

      <View className="flex-row items-center gap-10">
        {/* Radio: Sell */}
        <View className="flex-row items-center opacity-70">
          <LockIcon size={14} color="#94A3B8" />
          <View
            className={`ml-1.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'sell' ? 'border-[#15304D]' : 'border-gray-300'}`}
          >
            {listingType === 'sell' && (
              <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
            )}
          </View>
          <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
            بيع
          </Text>
        </View>

        {/* Radio: Rent */}
        <View className="flex-row items-center opacity-70">
          <LockIcon size={14} color="#94A3B8" />
          <View
            className={`ml-1.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'rent' ? 'border-[#15304D]' : 'border-gray-300'}`}
          >
            {listingType === 'rent' && (
              <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
            )}
          </View>
          <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
            إيجار
          </Text>
        </View>

        {/* Radio: Exchange */}
        <View className="flex-row items-center opacity-70">
          <LockIcon size={14} color="#94A3B8" />
          <View
            className={`ml-1.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'exchange' ? 'border-[#15304D]' : 'border-gray-300'}`}
          >
            {listingType === 'exchange' && (
              <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
            )}
          </View>
          <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
            بدل
          </Text>
        </View>
      </View>
    </View>
  );
}
