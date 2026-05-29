import { Image } from 'expo-image';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { HomeSearchIcon } from '@/assets/icons/home/header';

export interface SearchHeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  onBack: () => void;
  onFilterPress: () => void;
}

const CloseIcon = ({
  size = 16,
  color = '#94A3B8',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SearchHeader({
  searchText,
  setSearchText,
  isFocused,
  setIsFocused,
  onBack,
  onFilterPress,
}: SearchHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center border-b border-gray-100 bg-white px-5 pb-3 pt-3"
      style={{ paddingTop: Math.max(insets.top, 20) }}
    >
      {/* Right: Back Button */}
      <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="p-1">
        <Image
          source={require('@/assets/icons/arrow-back.svg')}
          style={{ width: 12, height: 18 }}
          contentFit="contain"
        />
      </TouchableOpacity>

      {/* Middle: Search Input Container */}
      <View
        className="ml-5 mr-2 h-[48px] flex-1 flex-row items-center rounded-full border bg-white px-4"
        style={{ borderColor: isFocused ? '#B28648' : '#D1D5DB' }}
      >
        {/* Search Icon  */}
        <HomeSearchIcon size={22} color="#989898" />

        {/* Input Field */}
        <TextInput
          className="h-full flex-1 px-2 text-right font-cairo-medium text-[#111111]"
          placeholder="ابحث عن عقار أو خدمة..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
        />

        {/* Clear 'X' Button (renders on LEFT of input box in RTL) */}
        {searchText.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchText('')} className="p-1">
            <CloseIcon size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <View className="w-6" /> // Placeholder to maintain spacing
        )}
      </View>

      {/* Left: Filter Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onFilterPress}
        className="h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F9FAFE]"
      >
        <Image
          source={require('@/assets/icons/home/header/filter-horizontal-icon.svg')}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
