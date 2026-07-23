import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileTabNavigationProps {
  activeTab: 'listings' | 'reviews';
  onTabChange: (tab: 'listings' | 'reviews') => void;
}

export default function ProfileTabNavigation({
  activeTab,
  onTabChange,
}: ProfileTabNavigationProps) {
  return (
    <View className="mt-6 flex-row items-center border-b border-gray-200 px-5">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('listings')}
        className={`flex-1 items-center border-b-2 pb-3 ${
          activeTab === 'listings' ? 'border-[#15304D]' : 'border-transparent'
        }`}
      >
        <Text
          className={`text-sm ${
            activeTab === 'listings'
              ? 'font-cairo-bold text-[#15304D]'
              : 'font-cairo-medium text-[#6B6A6A]'
          }`}
        >
          الإعلانات
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('reviews')}
        className={`flex-1 items-center border-b-2 pb-3 ${
          activeTab === 'reviews' ? 'border-[#15304D]' : 'border-transparent'
        }`}
      >
        <Text
          className={`text-sm ${
            activeTab === 'reviews'
              ? 'font-cairo-bold text-[#15304D]'
              : 'font-cairo-medium text-[#6B6A6A]'
          }`}
        >
          التقييمات
        </Text>
      </TouchableOpacity>
    </View>
  );
}
