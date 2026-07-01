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
        <ExploreSection title="عقارات" items={propertiesData} showViewAll />

        <ExploreSection
          title="خدمات الشركات"
          items={companyServicesData}
          showViewAll
        />

        <ExploreSection title="قوائم" items={listsData} />

        <ExploreSection title="حاسبات ذكية" items={smartCalculatorsData} />
      </ScrollView>
    </SafeAreaView>
  );
}
