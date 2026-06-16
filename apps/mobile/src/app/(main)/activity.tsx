import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddIcon } from '@/assets/icons/tab';
import ActivitySearchBar from '@/components/activity/ActivitySearchBar';
import { useMyActivity } from '@/hooks/useMyActivity';

const ACTIVITY_TABS = ['اعلاناتي', 'عروضي', 'تنبيهاتي'];
export default function ActivityScreen() {
  const router = useRouter();

  // Local UI state
  const [activeTab, setActiveTab] = useState('اعلاناتي');
  const [activeFilterId, setActiveFilterId] = useState<
    'ALL' | 'ACTIVE' | 'DRAFT'
  >('ALL');

  // Fetch Data (we fetch all listings and filter on the client side to compute dynamic counts)
  const {
    data = [],
    isLoading,
    error,
    refetch,
    freeAdsRemaining,
  } = useMyActivity();

  // Dynamic counts for filter pills
  const allCount = data.length;
  const activeCount = data.filter((item) => item.status === 'ACTIVE').length;
  const draftCount = data.filter((item) => item.status === 'DRAFT').length;

  const filterPills = [
    { id: 'DRAFT', label: `مسودة (${draftCount})` },
    { id: 'ACTIVE', label: `نشطة (${activeCount})` },
    { id: 'ALL', label: `الكل (${allCount})` },
  ];

  // Client-side filtering of properties
  const filteredData =
    activeFilterId === 'ALL'
      ? data
      : data.filter((item) => item.status === activeFilterId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* --- 1. Top Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="" />
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          نشاطي
        </Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full">
          <AddIcon size={30} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* --- 2. Search Bar --- */}
      <ActivitySearchBar
        onFilterPress={() => console.log('Filter Pressed')}
        onSortPress={() => console.log('Sort Pressed')}
      />

      {/* --- 3. Top Navigation Tabs --- */}
      <View className="border-b border-gray-100 bg-white">
        <View className="flex-row justify-around px-5">
          {ACTIVITY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`border-b-2 px-8 pb-2 pt-1 ${activeTab === tab ? 'border-[#15304D]' : 'border-transparent'}`}
            >
              <Text
                className={`text-[15px] ${activeTab === tab ? 'font-cairo-bold text-[#15304D]' : 'font-cairo text-[#6B6A6A]'}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#15304D"
          />
        }
      >
        <View className="px-5 pb-24 pt-4">
          {/* --- 4. Filter Pills --- */}
          {activeTab === 'اعلاناتي' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              contentContainerStyle={{ flexDirection: 'row-reverse' }}
            >
              {filterPills.map((pill) => (
                <TouchableOpacity
                  key={pill.id}
                  onPress={() => setActiveFilterId(pill.id as any)}
                  className={`mr-2 rounded-full border px-4 py-1 ${
                    activeFilterId === pill.id
                      ? 'border-[#B28648] bg-[#F5F7F9]'
                      : 'border-transparent bg-[#F5F7F9]'
                  }`}
                >
                  <Text className="text-[#111111] text-[14px] font-cairo">
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* --- 5. Dynamic Quota Banner --- */}
          {activeTab === 'اعلاناتي' && (
            <View className="mb-6">
              {/* Light background card for text & emoji */}
              <View className="flex-row items-center justify-between rounded-lg bg-[#F8FAFC] p-4">
                <Text className="relative -top-3 mr-4 text-3xl">🎉</Text>
                <View className="flex-1">
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15304D]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {freeAdsRemaining > 0
                      ? 'أعلن عن عقارك مجاناً'
                      : 'متبقي لديك 0 إعلان مجاني'}
                  </Text>
                  <Text
                    className="font-cairo text-[12px] leading-5 text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {freeAdsRemaining > 0
                      ? 'متبقي لديك 1 إعلان مجاني جاهز للنشر الآن. استغل الفرصة واجذب المشترين.'
                      : 'استهلكت إعلانك المجاني، رقي حسابك الآن لنشر عدد غير محدود من العقارات.'}
                  </Text>
                </View>
              </View>

              {/* Action Button outside the card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    (freeAdsRemaining > 0
                      ? '/add-listing'
                      : '/packages') as any,
                  )
                }
                className="mt-10 h-[50px] w-full items-center justify-center rounded-full bg-[#15304D]"
              >
                <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
                  {freeAdsRemaining > 0
                    ? 'أنشئ إعلانك المجاني الآن'
                    : 'اشتر باقة إعلانات'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- 6. List Area --- */}
          {isLoading && filteredData.length === 0 ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#15304D" />
            </View>
          ) : error ? (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-red-500">{error}</Text>
            </View>
          ) : filteredData.length === 0 ? (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-gray-400">
                لا توجد إعلانات حالياً
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {/* We will map over 'data' and render the cards in Card 2 */}
              <Text className="text-center font-cairo-medium text-gray-400">
                {filteredData.length} اعلانات جاهزة للعرض (سيتم بناء الكروت في
                الخطوة التالية)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
