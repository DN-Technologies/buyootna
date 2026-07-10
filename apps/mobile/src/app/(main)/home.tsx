import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeFilterPills from '@/components/home/HomeFilterPills';
import HomeHeader from '@/components/home/HomeHeader';
import HomePrimaryTabs from '@/components/home/HomePrimaryTabs';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import HomeAll from '@/components/home/sections/HomeAll';
import HomeCompanies from '@/components/home/sections/HomeCompanies';
import HomeProperties from '@/components/home/sections/HomeProperties';
import { feedService } from '@/core/api/feed.service';
import ContentContainer from '@/core/components/ContentContainer';
import GlobalFilterSheet from '@/core/components/filters/GlobalFilterSheet';
import { HomeFeedResponse } from '@/types/feed';

type PrimaryTab = 'all' | 'properties' | 'companies';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';
type CompanyFilter =
  | 'all'
  | 'finishing'
  | 'transport'
  | 'building'
  | 'decorations'
  | 'interior_design'
  | 'other';

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
  const [activeTab, setActiveTab] = useState<PrimaryTab>('all');
  const [activePropFilter, setActivePropFilter] =
    useState<PropertyFilter>('all');
  const [activeCompFilter, setActiveCompFilter] =
    useState<CompanyFilter>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const [feedData, setFeedData] = useState<HomeFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Fetch Function ---
  const loadFeed = async () => {
    try {
      const data = await feedService.getHomeFeed();
      setFeedData(data);
    } catch (error) {
      console.error('Failed to fetch home feed:', error);
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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        <View className="px-5 pt-4">
          {/* 1. Header Section */}
          <HomeHeader />

          {/* 2. Search Bar */}
          <HomeSearchBar
            onFilterPress={() => filterSheetRef.current?.present()}
          />

          {/* 3. Primary Tabs (الجميع | عقارات | شركات) */}
          <HomePrimaryTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* 4. Secondary Tabs (Filter Pills) */}
          <HomeFilterPills
            activeTab={activeTab}
            activePropFilter={activePropFilter}
            onPropFilterChange={setActivePropFilter}
            activeCompFilter={activeCompFilter}
            onCompFilterChange={setActiveCompFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </View>

        {/* 5. Scrolling Content Area (The Feed) */}
        {activeTab === 'properties' ? (
          <HomeProperties
            activeFilter={activePropFilter}
            refreshing={refreshing}
            onRefresh={onRefresh}
            viewMode={viewMode}
          />
        ) : activeTab === 'companies' ? (
          <HomeCompanies
            activeFilter={activeCompFilter}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <ScrollView
            className="flex-1"
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
      </ContentContainer>
    </SafeAreaView>
  );
}
