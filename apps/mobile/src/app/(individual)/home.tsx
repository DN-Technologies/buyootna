import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useScrollToTop } from '@react-navigation/native';
import { router } from 'expo-router';
import  { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import {
  HOME_SORT_OPTIONS,
  type HomeSort,
} from '@/features/individual/components/home/homeSort';
import HomeAll from '@/features/individual/components/home/sections/HomeAll';
import HomeOffices from '@/features/individual/components/home/sections/HomeOffices';
import HomeProperties from '@/features/individual/components/home/sections/HomeProperties';
import { feedService } from '@/features/individual/services/feed.service';
import StoryTray from '@/features/stories/components/StoryTray';
import { useStoriesFeed } from '@/features/stories/hooks/useStoriesQueries';
import ConnectionErrorModal from '@/shared/components/feedback/ConnectionErrorModal';
import GlobalFilterSheet from '@/shared/components/filters/GlobalFilterSheet';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useTabBarHeight } from '@/shared/hooks/device/useTabBarHeight';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { HomeFeedResponse } from '@/types/feed';

type PrimaryTab = 'all' | 'properties' | 'offices';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';

export default function HomeScreen() {
  const token = useAuthStore((state) => state.token);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const [sortBy, setSortBy] = useState<HomeSort>('DEFAULT');
  const { scrollContentBottomPadding } = useTabBarHeight();
  // Shared across all three possible active scrollables below (only one is
  // ever mounted at a time), so tapping the already-active Home tab scrolls
  // to top regardless of which sub-tab/view is currently showing.
  const scrollRef = useRef<any>(null);
  useScrollToTop(scrollRef);

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
    useState<PropertyFilter>('sale');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const [feedData, setFeedData] = useState<HomeFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { refetch: refetchStories } = useStoriesFeed();

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

  // --- Initial Load, and again on every login/logout ---
  // The (individual) tab group stays mounted underneath the (auth) flow
  // (see resetToIdentityHome in shared/navigation/getIdentityHomeRoute.ts),
  // so a successful login reuses this exact screen instance instead of
  // remounting it -- a mount-only effect here would keep showing whatever
  // was fetched before login until the app is force-restarted.
  useEffect(() => {
    loadFeed();
  }, [token]);

  // --- Pull to Refresh Handle ---
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(), refetchStories()]);
    setRefreshing(false);
  };

  const TABS = [
    { id: 'properties', label: 'عقارات' },
    { id: 'offices', label: 'مكاتب عقارية' },
  ];

  const renderHeader = (withHorizontalPadding = true) => (
    <View>
      {/* Stories (hidden when there are none) */}
      <StoryTray />
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
                    <View className="absolute bottom-[-10px] h-[2px] w-[80%] rounded-full bg-[#15304D]" />
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
          onPress={() => sortSheetRef.current?.present()}
          accessibilityRole="button"
          accessibilityLabel="الترتيب حسب"
          testID="home-sort-button"
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
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* 5. Scrolling Content Area (The Feed) */}
        {activeTab === 'properties' ? (
          <HomeProperties
            ref={scrollRef}
            activeFilter={activePropFilter}
            refreshing={refreshing}
            onRefresh={onRefresh}
            viewMode={viewMode}
            sortBy={sortBy}
            ListHeaderComponent={renderHeader(false)}
          />
        ) : activeTab === 'offices' ? (
          <HomeOffices
            ref={scrollRef}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={renderHeader(false)}
          />
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1 pt-4"
            contentContainerStyle={{
              paddingBottom: scrollContentBottomPadding,
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
            {renderHeader(true)}
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
        {/* Sorts the عقارات list; picking one from another tab opens it */}
        <RadioSelectionSheet
          ref={sortSheetRef}
          title="الترتيب حسب"
          options={HOME_SORT_OPTIONS}
          selectedValue={sortBy}
          onSelect={(value) => {
            setSortBy(value as HomeSort);
            if (activeTab !== 'properties') setActiveTab('properties');
          }}
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
