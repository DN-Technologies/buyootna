import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useListingStore } from '@/shared/store/useListingStore';

/**
 * «أنا مالك العقار»: an individual advertises as the owner (Ministry of
 * Commerce, December 2024 -- an owner may advertise if they follow the
 * rules and state that they own it). Required to publish; shown on the ad.
 */
export default function OwnerDeclaration() {
  const isOwner = useListingStore((state) => state.isOwner);
  const updateField = useListingStore((state) => state.updateField);

  return (
    <TouchableOpacity
      testID="owner-declaration"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isOwner }}
      activeOpacity={0.8}
      onPress={() => updateField('isOwner', !isOwner)}
      className="mb-4 w-full flex-row items-start rounded-xl border border-[#ECECEC] bg-[#F9FAFE] p-3"
      style={{ gap: 10 }}
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border-[1.5px] ${
          isOwner ? 'border-[#15304D] bg-[#15304D]' : 'border-[#D7D7D7] bg-white'
        }`}
      >
        {isOwner && <Feather name="check" size={14} color="#FFFFFF" />}
      </View>
      <View className="flex-1" style={{ gap: 2 }}>
        <Text
          className="font-cairo-semibold text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          أنا مالك العقار
        </Text>
        <Text
          className="font-cairo text-xs leading-5 text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          أقرّ بأنني مالك هذا العقار وأن السعر المعلن واضح ومحدد، وفق قرار
          وزارة التجارة.
        </Text>
      </View>
    </TouchableOpacity>
  );
}
