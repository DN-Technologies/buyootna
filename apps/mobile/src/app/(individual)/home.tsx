import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import  { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SortIcon } from '@/assets/icons';
import { FilterHorizontalIcon } from '@/assets/icons/home/header';
import HomeFilterPills from '@/features/individual/components/home/HomeFilterPills';
import HomeHeaderSkeleton from '@/features/individual/components/home/HomeHeaderSkeleton';
import HomeAll from '@/features/individual/components/home/sections/HomeAll';
import HomeOffices from '@/features/individual/components/home/sections/HomeOffices';
import HomeProperties from '@/features/individual/components/home/sections/HomeProperties';
import { feedService } from '@/features/individual/services/feed.service';
import ConnectionErrorModal from '@/shared/components/ConnectionErrorModal';
import ContentContainer from '@/shared/components/ContentContainer';
import GlobalFilterSheet from '@/shared/components/filters/GlobalFilterSheet';
import { HomeFeedResponse } from '@/types/feed';

type PrimaryTab = 'all' | 'properties' | 'offices';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';

export default function HomeScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);

  // Navigate to results screen with advanced filter payload
  const handleAdvancedSearch = useCallback(
    (data: { tab: string; filters: any }) => {
      router.push({
        pathname: '/search/results',
        params: {
          tab: data.tab,
          filters: JSON.stringify(data.filters),
        },
      });
    },
    [],
  );

  // --- State ---
  const [activeTab, setActiveTab] = useState<PrimaryTab>('properties');
  const [activePropFilter, setActivePropFilter] =
    useState<PropertyFilter>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const [feedData, setFeedData] = useState<HomeFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // --- Fetch Function ---
  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const data = await feedService.getHomeFeed();
      setFeedData(data);
      setShowErrorModal(false);
    } catch (error) {
      console.error('Failed to fetch home feed:', error);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    loadFeed();
  }, []);

  // --- Pull to Refresh Handle ---
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const TABS = [
    { id: 'properties', label: 'عقارات' },
    { id: 'offices', label: 'مكاتب عقارية' },
  ];

  const renderHeader = (withHorizontalPadding = true) => (
    <View className={` ${withHorizontalPadding ? 'px-[20px]' : ''}`}>
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

        {/* Filter Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => filterSheetRef.current?.present()}
          className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
        >
          <FilterHorizontalIcon size={18} color="#111111" />
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert('قريباً', 'ميزة الترتيب ستكون متاحة قريباً')}
          className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
        >
          <SortIcon size={18} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* 4. Secondary Tabs (Filter Pills) */}
      <HomeFilterPills
        activeTab={activeTab}
        activePropFilter={activePropFilter}
        onPropFilterChange={setActivePropFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* 5. Scrolling Content Area (The Feed) */}
        {activeTab === 'properties' ? (
          <HomeProperties
            activeFilter={activePropFilter}
            refreshing={refreshing}
            onRefresh={onRefresh}
            viewMode={viewMode}
            ListHeaderComponent={
              isLoading ? (
                <HomeHeaderSkeleton withHorizontalPadding={false} />
              ) : (
                renderHeader(false)
              )
            }
          />
        ) : activeTab === 'offices' ? (
          <HomeOffices
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              isLoading ? (
                <HomeHeaderSkeleton withHorizontalPadding={false} />
              ) : (
                renderHeader(false)
              )
            }
          />
        ) : (
          <ScrollView
            className="flex-1 pt-4"
            contentContainerStyle={{
              paddingBottom: 130,
            }} // Extra padding for the custom bottom bar
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#15304D']}
                tintColor="#15304D"
              />
            }
          >
            {isLoading ? (
              <HomeHeaderSkeleton withHorizontalPadding={true} />
            ) : (
              renderHeader(true)
            )}
            <HomeAll
              feedData={feedData}
              isLoading={isLoading}
              viewMode={viewMode}
            />
          </ScrollView>
        )}
        <GlobalFilterSheet
          ref={filterSheetRef}
          onApplyFilters={handleAdvancedSearch}
        />
        <ConnectionErrorModal
          visible={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          onRetry={loadFeed}
          isLoading={isLoading}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
