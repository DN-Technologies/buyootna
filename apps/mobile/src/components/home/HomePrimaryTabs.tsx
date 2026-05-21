import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type PrimaryTab = 'all' | 'properties' | 'companies';

interface HomePrimaryTabsProps {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
}

export default function HomePrimaryTabs({ activeTab, onTabChange }: HomePrimaryTabsProps) {
  return (
    <View className="mb-4 flex-row items-center border-b border-gray-200">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('all')}
        className={`flex-1 items-center border-b-2 pb-3 ${
          activeTab === 'all' ? 'border-[#15304D]' : 'border-transparent'
        }`}
      >
        <Text
          className={`text-base ${
            activeTab === 'all'
              ? 'font-cairo-bold text-[#15304D]'
              : 'font-cairo-medium text-[#6B6A6A]'
          }`}
        >
          الجميع
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('properties')}
        className={`flex-1 items-center border-b-2 pb-3 ${
          activeTab === 'properties' ? 'border-[#15304D]' : 'border-transparent'
        }`}
      >
        <Text
          className={`text-base ${
            activeTab === 'properties'
              ? 'font-cairo-bold text-[#15304D]'
              : 'font-cairo-medium text-[#6B6A6A]'
          }`}
        >
          عقارات
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabChange('companies')}
        className={`flex-1 items-center border-b-2 pb-3 ${
          activeTab === 'companies' ? 'border-[#15304D]' : 'border-transparent'
        }`}
      >
        <Text
          className={`text-base ${
            activeTab === 'companies'
              ? 'font-cairo-bold text-[#15304D]'
              : 'font-cairo-medium text-[#6B6A6A]'
          }`}
        >
          شركات
        </Text>
      </TouchableOpacity>
    </View>
  );
}
