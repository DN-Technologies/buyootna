import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityEmptyState from '@/features/individual/components/activity/ActivityEmptyState';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ActivityGuestView from '@/features/individual/components/activity/ActivityGuestView';
import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import ActivityListHeader from '@/features/individual/components/activity/ActivityListHeader';
import ActivityListItem from '@/features/individual/components/activity/ActivityListItem';
import ActivitySheets from '@/features/individual/components/activity/ActivitySheets';
import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ActivityTabsRow from '@/features/individual/components/activity/ActivityTabsRow';
import AlertListItem from '@/features/individual/components/activity/AlertListItem';
import AlertsEmptyState from '@/features/individual/components/activity/AlertsEmptyState';
import AlertsListHeader from '@/features/individual/components/activity/AlertsListHeader';
import {
  type ActivityTabId,
  type AdSortBy,
  TABS,
} from '@/features/individual/components/activity/constants';
import { useActivityFilters } from '@/features/individual/hooks/useActivityFilters';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useAdActions } from '@/features/individual/hooks/useAdActions';
import { useAlertActions } from '@/features/individual/hooks/useAlertActions';
import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { AlertItem } from '@/shared/api/alerts.service';
import { ActivityItem, useMyActivity } from '@/shared/hooks/useMyActivity';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function ActivityScreen() {
  const { token } = useAuthStore();
  const { tabBarHeight, scrollContentBottomPadding } = useTabBarHeight();
  const toastBottomOffset = tabBarHeight + 40;

  // Local UI state
  const [activeTab, setActiveTab] = useState<ActivityTabId>('ads');
  const [activeFilterId, setActiveFilterId] =
    useState<ActivityFilterType>('ALL');
  const [sortBy, setSortBy] = useState<AdSortBy>('NEWEST');
  const sortSheetRef = useRef<BottomSheetModal>(null);

  const listRef = useRef<FlashListRef<any>>(null);
  useScrollToTop(listRef);

  const { showToast, toastMessage, toastSubtitle, fadeAnim, slideAnim, triggerToast } =
    useActivityToast();

  // Toast notification triggered by a query param set on redirect back here
  // (e.g. after saving a listing edit).
  const params = useLocalSearchParams<{ showUpdateSuccess?: string }>();
  useEffect(() => {
    if (params.showUpdateSuccess === 'true') {
      const timer = triggerToast('تم تحديث بيانات الإعلان بنجاح.');
      router.setParams({ showUpdateSuccess: undefined });
      return () => clearTimeout(timer);
    }
  }, [params.showUpdateSuccess, triggerToast]);

  // Fetch Data (we fetch all listings and filter on the client side to compute dynamic counts)
  const {
    data = [],
    isLoading,
    error,
    refetch,
    freeAdsRemaining,
    hasSubscription,
    subscription,
  } = useMyActivity();

  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts,
  } = useMyAlerts();

  // Refetch on every focus -- the global 30s React Query staleTime means a
  // simple remount alone doesn't guarantee fresh data, so freeAdsRemaining
  // (and the ad list) could still show a value that's already out of date
  // by the time the user checks here vs. the Add Ad flow, which always
  // reads the live value directly (bypasses the query cache entirely).
  // Alerts follow the same rule -- an alert created from the Add Alert
  // screen wouldn't otherwise show up here until the 30s cache expired.
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
        refetchAlerts();
      }
    }, [token, refetch, refetchAlerts]),
  );

  const { filterPills, sortedAndFilteredData } = useActivityFilters(
    data,
    activeFilterId,
    sortBy,
  );

  const adActions = useAdActions({ refetch, triggerToast, freeAdsRemaining });
  const alertActions = useAlertActions({ alerts, refetchAlerts, triggerToast });

  // Handle redirect to login if unauthenticated. Must stay below every hook.
  if (!token) {
    return <ActivityGuestView onMenuPress={adActions.handleMenuPress} />;
  }

  const isAdsTab = activeTab === 'ads';
  const isAlertsTab = activeTab === 'alerts';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ActivityHeader
        onAddPress={() => router.push('/add-listing')}
        onMenuPress={adActions.handleMenuPress}
      />

      <ActivityTabsRow
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFilterPress={() =>
          setActiveFilterId((prev) => (prev === 'ALL' ? 'ACTIVE' : 'ALL'))
        }
        onSortPress={() => sortSheetRef.current?.present()}
      />

      {/* Scrolling list */}
      <FlashList
        ref={listRef}
        data={
          isAdsTab
            ? sortedAndFilteredData
            : isAlertsTab
              ? alerts
              : []
        }
        keyExtractor={(item) => item.id}
        getItemType={(item) =>
          isAlertsTab
            ? 'alert'
            : item.status === 'DRAFT'
              ? 'draft'
              : item.status === 'EXPIRED' || item.status === 'CLOSED'
                ? 'archived'
                : 'active'
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: scrollContentBottomPadding,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isAlertsTab ? isLoadingAlerts : isLoading}
            onRefresh={isAlertsTab ? refetchAlerts : refetch}
            tintColor="#15304D"
          />
        }
        ListHeaderComponent={
          isAdsTab ? (
            <ActivityListHeader
              filterPills={filterPills}
              activeFilterId={activeFilterId}
              onFilterChange={setActiveFilterId}
              hasSubscription={hasSubscription}
              subscription={subscription}
              freeAdsRemaining={freeAdsRemaining}
              onPromoPress={adActions.handlePromoAction}
            />
          ) : isAlertsTab && alerts && alerts.length > 0 ? (
            <AlertsListHeader
              allPaused={alertActions.allAlertsPaused}
              onToggleAll={alertActions.handleToggleAllAlerts}
            />
          ) : null
        }
        ListEmptyComponent={
          isAlertsTab ? (
            <AlertsEmptyState isLoading={isLoadingAlerts} error={alertsError} />
          ) : (
            <ActivityEmptyState
              isLoading={isLoading}
              error={error}
              activeFilterId={activeFilterId}
            />
          )
        }
        renderItem={({ item }) =>
          isAlertsTab ? (
            <AlertListItem
              alert={item as AlertItem}
              isActive={alertActions.isAlertActive((item as AlertItem).id)}
              onToggleActive={alertActions.handleToggleAlertActive}
              onDeletePress={alertActions.handleDeleteAlert}
            />
          ) : (
            <ActivityListItem
              property={item as ActivityItem}
              activeFilterId={activeFilterId}
              onEditPress={adActions.handleEditAd}
              onFeaturePress={adActions.handleFeatureAd}
              onDeletePress={adActions.handleDeleteAd}
              onPublishDraftPress={adActions.handlePublishDraft}
              onArchivedPress={(id) => router.push(`/property/${id}` as any)}
            />
          )
        }
      />

      <ActivitySheets
        adActions={adActions}
        alertActions={alertActions}
        sortSheetRef={sortSheetRef}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* --- Success Toast Notification --- */}
      <ActivitySuccessToast
        visible={showToast}
        message={toastMessage}
        subtitle={toastSubtitle}
        bottomOffset={toastBottomOffset}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />
    </SafeAreaView>
  );
}
