import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyRequestListItem from '@/features/company/components/requests/CompanyRequestListItem';
import ActivityEmptyState from '@/features/individual/components/activity/ActivityEmptyState';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ActivityGuestView from '@/features/individual/components/activity/ActivityGuestView';
import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import ActivityListHeader from '@/features/individual/components/activity/ActivityListHeader';
import ActivityListItem from '@/features/individual/components/activity/ActivityListItem';
import ActivitySheets from '@/features/individual/components/activity/ActivitySheets';
import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ActivityTabsRow from '@/features/individual/components/activity/ActivityTabsRow';
import AdsOptionsMenu from '@/features/individual/components/activity/AdsOptionsMenu';
import AlertDeleteToast from '@/features/individual/components/activity/AlertDeleteToast';
import AlertListItem from '@/features/individual/components/activity/AlertListItem';
import AlertsEmptyState from '@/features/individual/components/activity/AlertsEmptyState';
import AlertsListHeader from '@/features/individual/components/activity/AlertsListHeader';
import AlertsOptionsMenu from '@/features/individual/components/activity/AlertsOptionsMenu';
import {
  type ActivityTabId,
  ADD_ROUTE_BY_TAB,
  type AdSortBy,
  TABS,
} from '@/features/individual/components/activity/constants';
import { useActivityFilters } from '@/features/individual/hooks/useActivityFilters';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useAdActions } from '@/features/individual/hooks/useAdActions';
import { useAlertActions } from '@/features/individual/hooks/useAlertActions';
import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { AlertItem } from '@/shared/api/alerts.service';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';
import { ActivityItem, useMyActivity } from '@/shared/hooks/properties/useMyActivity';
import { useMyRequests } from '@/shared/hooks/properties/useMyRequests';
import { useTabBarHeight } from '@/shared/hooks/device/useTabBarHeight';
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
  const filterSheetRef = useRef<BottomSheetModal>(null);

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

  // Price-quote requests this identity submitted (عروضي tab).
  const {
    data: myRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useMyRequests();

  // Refetch on every focus -- the global 30s React Query staleTime means a
  // simple remount alone doesn't guarantee fresh data, so freeAdsRemaining
  // (and the ad list) could still show a value that's already out of date
  // by the time the user checks here vs. the Add Ad flow, which always
  // reads the live value directly (bypasses the query cache entirely).
  // Alerts follow the same rule -- an alert created from the Add Alert
  // screen wouldn't otherwise show up here until the 30s cache expired.
  // Same for submitted quote requests: a request created from the
  // request-quote screen or a company profile must appear the next time
  // this screen is focused.
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
        refetchAlerts();
        refetchRequests();
      }
    }, [token, refetch, refetchAlerts, refetchRequests]),
  );

  const { filterPills, sortedAndFilteredData } = useActivityFilters(
    data,
    activeFilterId,
    sortBy,
  );

  const adActions = useAdActions({
    refetch,
    triggerToast,
    freeAdsRemaining,
    listedAds: sortedAndFilteredData as ActivityItem[],
  });
  const alertActions = useAlertActions({ alerts, refetchAlerts, triggerToast });

  // Handle redirect to login if unauthenticated. Must stay below every hook.
  if (!token) {
    return <ActivityGuestView onMenuPress={adActions.handleMenuPress} />;
  }

  const isAdsTab = activeTab === 'ads';
  const isOffersTab = activeTab === 'offers';
  const isAlertsTab = activeTab === 'alerts';

  // Refresh only the list that's on screen
  const listRefresh = isAlertsTab
    ? { refreshing: isLoadingAlerts, onRefresh: refetchAlerts }
    : isOffersTab
      ? { refreshing: isLoadingRequests, onRefresh: refetchRequests }
      : { refreshing: isLoading, onRefresh: refetch };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ActivityHeader
        onAddPress={() => router.push(ADD_ROUTE_BY_TAB[activeTab] as any)}
        onMenuPress={
          isAlertsTab
            ? alertActions.handleOpenOptionsMenu
            : isOffersTab
              ? // عروضي has no bulk ads actions — its ⋮ must not open the
                // ads options menu / delete-all sheet (QA)
                undefined
              : adActions.handleMenuPress
        }
      />

      <ActivityTabsRow
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // تصفية البحث: opens the status filter sheet; only the ads tab
        // has filters (it used to silently toggle ALL/ACTIVE -- QA)
        onFilterPress={
          isAdsTab ? () => filterSheetRef.current?.present() : undefined
        }
        isFilterActive={isAdsTab && activeFilterId !== 'ALL'}
        onSortPress={() => sortSheetRef.current?.present()}
      />

      {/* Scrolling list */}
      <FlashList
        ref={listRef}
        data={
          isAdsTab
            ? sortedAndFilteredData
            : isAlertsTab
              ? alertActions.displayedAlerts
              : isOffersTab
                ? myRequests
                : []
        }
        keyExtractor={(item) => item.id}
        getItemType={(item) =>
          isAlertsTab
            ? 'alert'
            : isOffersTab
              ? 'request'
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
            refreshing={listRefresh.refreshing}
            onRefresh={listRefresh.onRefresh}
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
          ) : isAlertsTab && alertActions.displayedAlerts && alertActions.displayedAlerts.length > 0 ? (
            <AlertsListHeader
              allPaused={alertActions.allAlertsPaused}
              onToggleAll={alertActions.handleToggleAllAlerts}
            />
          ) : null
        }
        ListEmptyComponent={
          isAlertsTab ? (
            <AlertsEmptyState
              isLoading={isLoadingAlerts}
              error={alertsError}
              onAddAlertPress={() => router.push('/add-alert' as any)}
            />
          ) : isOffersTab ? (
            // عروضي is only reachable signed-in (guests get
            // ActivityGuestView), so no create-account/sign-in actions here
            <GuestEmptyState
              icon="file-text"
              title="لا توجد طلبات بعد"
              description={
                requestsError ||
                'طلبات عرض السعر التي ترسلها ستظهر هنا لتتابع حالتها.'
              }
              showAuthActions={false}
            />
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
              onPress={() => alertActions.handleOpenAlertDetails(item as AlertItem)}
            />
          ) : isOffersTab ? (
            <CompanyRequestListItem request={item as any} />
          ) : (
            <ActivityListItem
              property={item as ActivityItem}
              activeFilterId={activeFilterId}
              onEditPress={adActions.handleEditAd}
              onFeaturePress={adActions.handleFeatureAd}
              onDeletePress={adActions.handleDeleteAd}
              onPublishDraftPress={adActions.handlePublishDraft}
              onOpenPress={(property) =>
                router.push({
                  pathname: `/property/${property.id}`,
                  // Archived ads open with their republish action
                  params:
                    property.status === 'EXPIRED' ||
                    property.status === 'CLOSED' ||
                    activeFilterId === 'ARCHIVED'
                      ? { archived: 'true' }
                      : {},
                } as any)
              }
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
        filterSheetRef={filterSheetRef}
        filterPills={filterPills}
        activeFilterId={activeFilterId}
        onFilterChange={setActiveFilterId}
      />

      <AlertsOptionsMenu
        visible={alertActions.isOptionsMenuVisible}
        onClose={alertActions.handleCloseOptionsMenu}
        onDeleteAllPress={alertActions.handlePromptDeleteAllAlerts}
      />

      {/* Header "⋮" on the ads tab: options menu for ads */}
      <AdsOptionsMenu
        visible={adActions.isOptionsMenuVisible}
        onClose={adActions.handleCloseOptionsMenu}
        allHidden={adActions.allHidden}
        onToggleVisibilityPress={adActions.handlePromptToggleVisibility}
        onDeleteAllPress={adActions.handlePromptDeleteAll}
        disabled={adActions.listedAdsCount === 0}
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

      {/* --- Delete Alert Toast Notification --- */}
      <AlertDeleteToast
        visible={alertActions.isDeleteToastVisible}
        onUndo={alertActions.handleUndoDeleteAlert}
        onDismiss={alertActions.handleDismissDeleteToast}
      />
    </SafeAreaView>
  );
}
