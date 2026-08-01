import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { SortingIcon } from '@/assets/icons/activity/index';
import {
  FilterHorizontalIcon,
  HomeSearchIcon,
} from '@/assets/icons/home/header/index';

interface ActivitySearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  onSortPress?: () => void;
  placeholder?: string;
}

export default function ActivitySearchBar({
  value,
  onChangeText,
  onFilterPress,
  onSortPress,
  placeholder = 'ابحث عن نشاط...',
}: ActivitySearchBarProps) {
  return (
    <View className="mb-6 flex-row items-center gap-2 px-5">
      {/* Search Input */}
      <View
        className="h-[45px] flex-1 flex-row items-center gap-1 rounded-full bg-[#F8FAFC] px-4"
        style={{
          boxShadow: '0px 0px 1px 0px #00000026',
        }}
      >
        <HomeSearchIcon size={24} color="#989898" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#989898"
          className="relative top-0.5 ml-1 flex-1 text-right font-cairo text-sm leading-[22px] text-[#111111]"
          style={{ textAlign: 'right' }}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onFilterPress}
        className="h-[45px] w-[45px] items-center justify-center rounded-full bg-[#F8FAFC]"
        style={{
          boxShadow: '0px 0px 1px 0px #00000026',
        }}
      >
        <FilterHorizontalIcon size={20} color="#111111" />
      </TouchableOpacity>

      {/* Sorting Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSortPress}
        className="h-[45px] w-[45px] items-center justify-center rounded-full bg-[#F8FAFC]"
        style={{
          boxShadow: '0px 0px 1px 0px #00000026',
        }}
      >
        <SortingIcon size={22} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
