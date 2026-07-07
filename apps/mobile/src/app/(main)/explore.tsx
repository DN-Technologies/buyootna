import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapIcon } from '@/assets/icons/home/header';
import ExploreSection from '@/components/explore/ExploreSection';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import {
  companyServicesData,
  listsData,
  propertiesData,
  smartCalculatorsData,
} from '@/constants/exploreData';

export default function ExploreScreen() {
  const router = useRouter();

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="px-5 pb-3">
        {/* Top Header Row: Map & Title */}
        <View className="flex-row items-center justify-between py-5">
          {/* Spacer to keep title centered */}
          <View className="w-10" />

          {/* Centered Title */}
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            استكشف
          </Text>

          {/* Map Button */}
          <TouchableOpacity activeOpacity={0.7}>
            <MapIcon size={24} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Search & Filter Row */}
        <HomeSearchBar />
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
