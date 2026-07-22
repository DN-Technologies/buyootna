import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SortingIcon } from '@/assets/icons/activity';
import { FilterHorizontalIcon, MapIcon } from '@/assets/icons/home/header';
import ExploreSection from '@/components/explore/ExploreSection';
import {
  companyServicesData,
  listsData,
  propertiesData,
  smartCalculatorsData,
} from '@/constants/exploreData';

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'properties' | 'companies' | 'auctions' | 'deals'
  >('properties');
  const [, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>(
    'NEWEST',
  );

  const TABS = [
    { id: 'properties', label: 'عقارات' },
    { id: 'companies', label: 'شركات' },
    { id: 'auctions', label: 'مزادات' },
    { id: 'deals', label: 'صفقات' },
  ];

  const handleItemPress = (item: any) => {
    if (item.isSoon) return;

    if (item.searchTab && item.searchFilters) {
      router.push({
        pathname: '/search/results',
        params: {
          tab: item.searchTab,
          filters: JSON.stringify(item.searchFilters),
        },
      });
    }
  };

  const handleFilterPress = () => {
    router.push({
      pathname: '/search',
      params: { openFilter: 'true' },
    });
  };

  const handleSortPress = () => {
    Alert.alert(
      'ترتيب الإعلانات',
      'اختر طريقة ترتيب الإعلانات:',
      [
        {
          text: 'الأحدث أولاً',
          onPress: () => {
            setSortBy('NEWEST');
            router.push({
              pathname: '/search/results',
              params: { tab: activeTab, sort: 'NEWEST' },
            });
          },
        },
        {
          text: 'السعر: من الأعلى إلى الأقل',
          onPress: () => {
            setSortBy('PRICE_DESC');
            router.push({
              pathname: '/search/results',
              params: { tab: activeTab, sort: 'PRICE_DESC' },
            });
          },
        },
        {
          text: 'السعر: من الأقل إلى الأعلى',
          onPress: () => {
            setSortBy('PRICE_ASC');
            router.push({
              pathname: '/search/results',
              params: { tab: activeTab, sort: 'PRICE_ASC' },
            });
          },
        },
        { text: 'إلغاء', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="px-5 pb-3">
        {/* Top Header Row: Map & Title */}
        <View className="flex-row items-center justify-between py-5">
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} className="w-10">
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            استكشف
          </Text>

          {/* Map Button */}
          <TouchableOpacity activeOpacity={0.7} className="w-10 items-end">
            <MapIcon size={24} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Tabs & Controls Row */}
        <View className="mb-4 flex-row items-center gap-2">
          {/* Tab Pill Container */}
          <View className="h-[45px] flex-1 flex-row items-center justify-between rounded-full border border-gray-100 bg-[#F8FAFC] px-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className="h-full flex-1 items-center justify-center rounded-full"
                  activeOpacity={0.7}
                >
                  <View className="items-center justify-center">
                    <Text
                      className={`${
                        isActive
                          ? 'font-cairo-bold text-[#15304D]'
                          : 'font-cairo text-[#6B6A6A]'
                      } text-sm leading-[22px]`}
                    >
                      {tab.label}
                    </Text>
                    {isActive && (
                      <View className="absolute bottom-[-10px] h-[2px] w-12 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {/*  Filter Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleFilterPress}
            className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
          >
            <FilterHorizontalIcon size={18} color="#111111" />
          </TouchableOpacity>
          {/* Sort Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSortPress}
            className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
          >
            <SortingIcon size={18} color="#111111" />
          </TouchableOpacity>
        </View>
      </View>
      {/* --- 2. Scrollable Body Content --- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          paddingTop: 10,
        }}
      >
        <ExploreSection
          title="عقارات"
          items={propertiesData.map((item) => ({
            ...item,
            onPress: () => handleItemPress(item),
          }))}
          showViewAll
          onViewAllPress={() => {
            router.push({
              pathname: '/search/results',
              params: { tab: 'properties' },
            });
          }}
        />

        <ExploreSection
          title="خدمات الشركات"
          items={companyServicesData.map((item) => ({
            ...item,
            onPress: () => handleItemPress(item),
          }))}
          showViewAll
          onViewAllPress={() => {
            router.push({
              pathname: '/search/results',
              params: { tab: 'companies' },
            });
          }}
        />

        <ExploreSection
          title="قوائم"
          items={listsData.map((item) => ({
            ...item,
            onPress: () => handleItemPress(item),
          }))}
        />

        <ExploreSection title="حاسبات ذكية" items={smartCalculatorsData} />
      </ScrollView>
    </SafeAreaView>
  );
}
