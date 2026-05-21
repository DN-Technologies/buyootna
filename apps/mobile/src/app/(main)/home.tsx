import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FilterHorizontalIcon,
  HomeSearchIcon,
  MapIcon,
  NotificationIcon,
  UserIcon,
} from '@/assets/icons/home/header/index';
import { useAuthStore } from '@/store/useAuthStore';

// Types for our primary tabs
type PrimaryTab = 'all' | 'properties' | 'companies';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<PrimaryTab>('all');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="px-5 pt-4">
        {/* 1. Header Section */}
        <View className="mb-2 flex-row items-center justify-between">
          {/* Right Side (RTL) - Avatar & Greeting */}
          <View className="flex-row items-center gap-2">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              {/* User Mock Image from Figma design */}
              <Image
                source={require('@/assets/mock/user-mock-image.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <View className="items-start">
              <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
                مرحباً بك!
              </Text>
              <Text className="font-cairo-bold text-base text-[#111111]">
                {/* Fallback to a default name if user data doesn't have it yet */}
                {user?.email ? user.email.split('@')[0] : 'نواف الجارحي'}
              </Text>
            </View>
          </View>

          {/* Left Side (RTL) - Icons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity activeOpacity={0.7} className="relative">
              <NotificationIcon size={24} color="#111111" />
              {/* Red notification dot */}
              <View className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full bg-[#BA0003]" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <MapIcon size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search Bar */}
        <View className="mb-6 flex-row items-center">
          <View className="mr-3 h-[45px] flex-1 flex-row items-center gap-1 rounded-full border border-gray-100 bg-[#F8FAFC] px-4">
            <HomeSearchIcon size={20} color="#94A3B8" />
            <TextInput
              placeholder="ابحث عن عقار أو خدمة..."
              placeholderTextColor="#94A3B8"
              className="relative top-1 mr-2 flex-1 text-right font-cairo-semibold text-sm text-[#989898]"
              style={{ textAlign: 'right' }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
          >
            <FilterHorizontalIcon size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* 3. Primary Tabs (الجميع | عقارات | شركات) */}
        <View className="mb-4 flex-row items-center border-b border-gray-200">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('all')}
            className={`flex-1 items-center border-b-2 pb-3 ${activeTab === 'all' ? 'border-[#15304D]' : 'border-transparent'}`}
          >
            <Text
              className={`text-base ${activeTab === 'all' ? 'font-cairo-bold text-[#15304D]' : 'font-cairo-medium text-[#6B6A6A]'}`}
            >
              الجميع
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('properties')}
            className={`flex-1 items-center border-b-2 pb-3 ${activeTab === 'properties' ? 'border-[#15304D]' : 'border-transparent'}`}
          >
            <Text
              className={`text-base ${activeTab === 'properties' ? 'font-cairo-bold text-[#15304D]' : 'font-cairo-medium text-[#6B6A6A]'}`}
            >
              عقارات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('companies')}
            className={`flex-1 items-center border-b-2 pb-3 ${activeTab === 'companies' ? 'border-[#15304D]' : 'border-transparent'}`}
          >
            <Text
              className={`text-base ${activeTab === 'companies' ? 'font-cairo-bold text-[#15304D]' : 'font-cairo-medium text-[#6B6A6A]'}`}
            >
              شركات
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Scrollable Content Area */}
      <ScrollView
        className="flex-1 bg-[#F8FAFC]"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 100,
        }} // paddingBottom ensures content isn't hidden by custom tab bar
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder for dynamic content based on activeTab */}
        <View className="items-center justify-center py-20">
          <Text className="font-cairo-semibold text-gray-400">
            {activeTab === 'all' && 'سيتم عرض العقارات والشركات هنا'}
            {activeTab === 'properties' && 'سيتم عرض العقارات هنا'}
            {activeTab === 'companies' && 'سيتم عرض الشركات هنا'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
