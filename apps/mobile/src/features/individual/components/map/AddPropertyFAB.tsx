import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

import { AddIcon } from '@/assets/icons/add-listing';

export default function AddPropertyFAB() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/add-listing')}
      // Positioning absolute at bottom-left, ensuring it sits above the bottom tab navigator (approx 90px from bottom)
      className="absolute bottom-[50px] right-5 z-10 h-[44px] w-[100px] flex-row items-center justify-center gap-2 rounded-full bg-[#15304D] shadow-lg shadow-gray-400/50"
    >
      <AddIcon size={14} color="#FFFFFF" />
      <Text className="font-cairo text-[14px] leading-[22px] text-white">
        إضافة
      </Text>
    </TouchableOpacity>
  );
}
