import { useRouter } from 'expo-router';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { FilterHorizontalIcon, HomeSearchIcon } from '@/assets/icons/home/header/index';

export default function HomeSearchBar() {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleFilterPress = () => {
    router.push({
      pathname: '/search',
      params: { openFilter: 'true' },
    });
  };

  return (
    <View className="mb-6 flex-row items-center">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSearchPress}
        className="mr-3 h-[45px] flex-1 flex-row items-center gap-1 rounded-full border border-gray-100 bg-[#F8FAFC] px-4"
      >
        <HomeSearchIcon size={20} color="#94A3B8" />
        <TextInput
          placeholder="ابحث عن عقار أو خدمة..."
          placeholderTextColor="#94A3B8"
          className="relative top-1 mr-2 flex-1 text-right font-cairo-semibold text-sm text-[#989898]"
          style={{ textAlign: 'right' }}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleFilterPress}
        className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
      >
        <FilterHorizontalIcon size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}

