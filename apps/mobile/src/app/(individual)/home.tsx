import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useScrollToTop } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import  { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import HomeFilterPills from '@/features/individual/components/home/HomeFilterPills';
import {
  HOME_SORT_OPTIONS,
  type HomeSort,
} from '@/features/individual/components/home/homeSort';
import HomeSortRow from '@/features/individual/components/home/HomeSortRow';
import HomeAll from '@/features/individual/components/home/sections/HomeAll';
import HomeOffices from '@/features/individual/components/home/sections/HomeOffices';
import HomeProperties from '@/features/individual/components/home/sections/HomeProperties';
import type { HomeMode } from '@/features/individual/components/home/topbar/HomeModeSwitch';
import HomeTopBar from '@/features/individual/components/home/topbar/HomeTopBar';
import { useCollapsibleHeader } from '@/features/individual/components/home/useCollapsibleHeader';
import { feedService } from '@/features/individual/services/feed.service';
import StoriesList from '@/features/stories/components/StoriesList';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import ConnectionErrorModal from '@/shared/components/feedback/ConnectionErrorModal';
import GlobalFilterSheet from '@/shared/components/filters/GlobalFilterSheet';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import FadeLayer from '@/shared/components/ui/FadeLayer';
import GoldSegment, {
  type GoldSegmentOption,
} from '@/shared/components/ui/GoldSegment';
import { useBlocksVersion } from '@/shared/hooks/blocks/useBlocks';
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
  // The design opens on the quick list (عرض سريع)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  // «الرئيسية» or «القصص» (the top bar's switch)
  const [mode, setMode] = useState<HomeMode>('home');
  const authSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);
  // Lists mounted on first visit, then kept (see the FadeLayers below)
  const visited = {
    offices: useRef(false),
    stories: useRef(false),
  };
  if (activeTab === 'offices') visited.offices.current = true;
  if (mode === 'stories') visited.stories.current = true;

  // The tabs + pills slide away while a list scrolls down (the top bar
  // stays); a switch brings them back, since each list keeps its scroll
  const collapse = useCollapsibleHeader();
  // The header floats over the lists, which start below it: its full height
  // (the top bar, plus the tabs + pills however far they've slid away)
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const headerInset = topBarHeight + blockHeight;
  const { show: showHeader } = collapse;
  useEffect(() => {
    showHeader();
  }, [activeTab, mode, showHeader]);

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

  // --- Initial Load, and again on every login/logout ---
  // The (individual) tab group stays mounted underneath the (auth) flow
  // (see resetToIdentityHome in shared/navigation/getIdentityHomeRoute.ts),
  // so a successful login reuses this exact screen instance instead of
  // remounting it -- a mount-only effect here would keep showing whatever
  // was fetched before login until the app is force-restarted.
  useEffect(() => {
    loadFeed();
  }, [token]);

  // A block or unblock changes whose ads the feed may show: reload it
  const blocksVersion = useBlocksVersion((s) => s.version);
  useEffect(() => {
    if (blocksVersion > 0) void loadFeed();
     
  }, [blocksVersion]);

  // --- Pull to Refresh Handle ---
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const TABS: GoldSegmentOption<'properties' | 'offices'>[] = [
    { id: 'properties', label: 'عقارات' },
    { id: 'offices', label: 'مكاتب عقارية' },
  ];

  // Above the عقارات list: «الترتيب حسب» and the list / photos toggle
  const sortRow = (
    <HomeSortRow
      onSortPress={() => sortSheetRef.current?.present()}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* The top bar (Figma 9297:75802) over the content, with the tabs +
            pills under it on the home. White while those show; once they
            slide away only the top bar's buttons float over the list */}
        <View
          style={
            mode === 'home'
              ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }
              : undefined
          }
        >
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-white"
            style={collapse.backgroundStyle}
          />
          <View
            className="pt-[8px]"
            onLayout={(e) => setTopBarHeight(e.nativeEvent.layout.height)}
          >
            <HomeTopBar
              mode={mode}
              onModeChange={setMode}
              authSheetRef={authSheetRef}
              onSwitchProfile={() => profileSheetRef.current?.present()}
            />
          </View>
          {mode === 'home' ? (
            <Animated.View style={collapse.animatedStyle}>
              <Animated.View
                onLayout={(e) => {
                  collapse.onLayout(e);
                  setBlockHeight(e.nativeEvent.layout.height);
                }}
                className="py-[12px]"
                style={[{ gap: 12 }, collapse.contentStyle]}
              >
                <View className="h-[42px] flex-row items-center px-[16px]" style={{ gap: 12 }}>
                  <GoldSegment
                    testID="home-tabs"
                    options={TABS}
                    value={activeTab === 'offices' ? 'offices' : 'properties'}
                    onChange={setActiveTab}
                  />
                  <TouchableOpacity
                    testID="home-filter-button"
                    accessibilityRole="button"
                    accessibilityLabel="الفلاتر"
                    activeOpacity={0.7}
                    onPress={() => filterSheetRef.current?.present()}
                    className="size-[40px] shrink-0 items-center justify-center rounded-full"
                    style={{ borderWidth: 0.3, borderColor: '#C5A36D' }}
                  >
                    <View className="size-[22px] items-center justify-center">
                      <Image
                        source={require('@/assets/icons/home/topbar/filter.svg')}
                        style={{ width: 17.5, height: 15.667 }}
                        contentFit="contain"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                <HomeFilterPills
                  activeTab={activeTab}
                  activePropFilter={activePropFilter}
                  onPropFilterChange={setActivePropFilter}
                />
              </Animated.View>
            </Animated.View>
          ) : (
            <View className="h-[12px]" />
          )}
        </View>

        {/* Each list stays mounted once opened and they cross-fade, so a
            switch is a smooth fade instead of a rebuild (and each keeps its
            scroll) */}
        <View className="flex-1">
          <FadeLayer active={mode === 'home' && activeTab !== 'offices'}>
            {activeTab === 'all' ? (
              <ScrollView
                ref={scrollRef}
                className="flex-1 px-[16px] pt-[12px]"
                contentContainerStyle={{
                  paddingTop: headerInset,
                  paddingBottom: scrollContentBottomPadding,
                }} // Extra padding for the custom bottom bar
                showsVerticalScrollIndicator={false}
                {...collapse.scrollHandlers}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    progressViewOffset={headerInset}
                    colors={['#15304D']}
                    tintColor="#15304D"
                  />
                }
              >
                {sortRow}
                <HomeAll
                  feedData={feedData}
                  isLoading={isLoading}
                  viewMode={viewMode}
                />
              </ScrollView>
            ) : (
              <HomeProperties
                ref={
                  mode === 'home' && activeTab === 'properties'
                    ? scrollRef
                    : undefined
                }
                activeFilter={activePropFilter}
                refreshing={refreshing}
                onRefresh={onRefresh}
                viewMode={viewMode}
                sortBy={sortBy}
                ListHeaderComponent={sortRow}
                scrollHandlers={collapse.scrollHandlers}
                topInset={headerInset}
              />
            )}
          </FadeLayer>
          {visited.offices.current && (
            <FadeLayer active={mode === 'home' && activeTab === 'offices'}>
              <HomeOffices
                ref={
                  mode === 'home' && activeTab === 'offices'
                    ? scrollRef
                    : undefined
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                scrollHandlers={collapse.scrollHandlers}
                topInset={headerInset}
              />
            </FadeLayer>
          )}
          {visited.stories.current && (
            <FadeLayer active={mode === 'stories'}>
              <StoriesList authSheetRef={authSheetRef} />
            </FadeLayer>
          )}
        </View>
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
        <AuthGuardSheet ref={authSheetRef} />
        {/* A double tap on the avatar: switch profile (as in المزيد) */}
        <ProfileBottomSheet
          ref={profileSheetRef}
          onAddAccount={() => {
            profileSheetRef.current?.dismiss();
            router.push('/(auth)/add-identity');
          }}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
