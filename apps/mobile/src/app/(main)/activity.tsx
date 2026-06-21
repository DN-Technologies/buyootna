import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddIcon } from '@/assets/icons/tab';
import ActiveAdCard from '@/core/components/activity/ActiveAdCard';
import ActivitySearchBar from '@/core/components/activity/ActivitySearchBar';
import DraftAdCard from '@/core/components/activity/DraftAdCard';
import { useMyActivity } from '@/hooks/useMyActivity';
import { useAuthStore } from '@/store/useAuthStore';

const ACTIVITY_TABS = ['اعلاناتي', 'عروضي', 'تنبيهاتي'];

export default function ActivityScreen() {
  const router = useRouter();
  const { token } = useAuthStore();

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

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-5 py-4 ">
          <View className="" />
          <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
            نشاطي
          </Text>
          <View className="w-10 h-10" />
        </View>

        {/* --- Lock Container --- */}
        <View className="flex-1 items-center justify-center px-6 pb-20">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#15304D]/10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#15304D]">
              <Feather name="lock" size={30} color="white" />
            </View>
          </View>

          <Text className="mb-3 font-cairo-bold text-xl text-[#15304D] text-center">
            تسجيل الدخول مطلوب
          </Text>

          <Text className="mb-8 font-cairo text-[14px] leading-6 text-[#6B6A6A] text-center">
            يرجى تسجيل الدخول إلى حسابك لتتمكن من إضافة عقاراتك وإدارة مسوداتك، ومتابعة عروضك وتنبيهاتك أولاً بأول.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/selection' as any)}
            className="h-[52px] w-full items-center justify-center rounded-full bg-[#15304D] shadow-lg shadow-[#15304D]/25"
          >
            <Text className="font-cairo-semibold text-[15px] text-white">
              تسجيل الدخول أو إنشاء حساب
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  const handleOpenOptions = (propertyId: string) => {
    console.log('Open options for:', propertyId);
  };

  const handlePublishDraft = (property: any) => {
    console.log('Publish draft:', property.id);
  };

  const handleDeleteDraft = (propertyId: string) => {
    console.log('Delete draft:', propertyId);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* --- 1. Top Header --- */}
      <View className="flex-row items-center justify-between bg-white px-5 py-4">
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

      {/* Scrolling list */}
      <FlatList
        data={activeTab === 'اعلاناتي' ? filteredData : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#15304D"
          />
        }
        // Render List Header (Filters & Quota Banner)
        ListHeaderComponent={
          activeTab === 'اعلاناتي' ? (
            <>
              {/* --- 4. Filter Pills --- */}
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
                    <Text className="font-cairo text-[14px] text-[#111111]">
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* --- 5. Dynamic Quota Banner --- */}
              <View className="mb-6">
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

                {/* Action Button */}
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
            </>
          ) : null
        }
        // Render Empty State
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#15304D" />
            </View>
          ) : error ? (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-red-500">{error}</Text>
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-gray-400">
                لا توجد إعلانات حالياً
              </Text>
            </View>
          )
        }
        // --- Render the Cards based on Status ---
        renderItem={({ item }) => {
          if (item.status === 'DRAFT') {
            return (
              <DraftAdCard
                property={item}
                onPublishPress={() => handlePublishDraft(item)}
                onDeletePress={() => handleDeleteDraft(item.id)}
              />
            );
          }

          return (
            <ActiveAdCard
              property={item}
              onOptionsPress={() => handleOpenOptions(item.id)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
