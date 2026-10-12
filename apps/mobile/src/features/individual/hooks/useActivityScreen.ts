import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import {
  type ActivityTabId,
  type AdSortBy,
} from '@/features/individual/components/activity/constants';
import { useActivityFilters } from '@/features/individual/hooks/useActivityFilters';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useAdActions } from '@/features/individual/hooks/useAdActions';
import { useAlertActions } from '@/features/individual/hooks/useAlertActions';
import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { useRequestActions } from '@/features/individual/hooks/useRequestActions';
import { useTabBarHeight } from '@/shared/hooks/device/useTabBarHeight';
import { ActivityItem, useMyActivity } from '@/shared/hooks/properties/useMyActivity';
import { useMyRequests } from '@/shared/hooks/properties/useMyRequests';
import { useAuthStore } from '@/shared/store/useAuthStore';

const TAB_IDS: ActivityTabId[] = ['ads', 'offers', 'alerts'];

/**
 * All state, data and effects of the نشاطي screen. The screen itself only
 * lays out what this returns, so every hook here runs before its guest early
 * return.
 */
export function useActivityScreen() {
  const { token } = useAuthStore();
  const { tabBarHeight, scrollContentBottomPadding } = useTabBarHeight();

  const [activeTab, setActiveTab] = useState<ActivityTabId>('ads');
  const [activeFilterId, setActiveFilterId] =
    useState<ActivityFilterType>('ALL');
  const [sortBy, setSortBy] = useState<AdSortBy>('NEWEST');
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const listRef = useRef<FlashListRef<any>>(null);
  useScrollToTop(listRef);

  const {
    showToast,
    toastMessage,
    toastSubtitle,
    fadeAnim,
    slideAnim,
    triggerToast,
  } = useActivityToast();

  const params = useLocalSearchParams<{
    showUpdateSuccess?: string;
    draftSaved?: string;
    tab?: string;
  }>();

  // Deep link to a tab (e.g. "عرض تنبيهاتي" after creating an alert)
  useEffect(() => {
    const tab = TAB_IDS.find((id) => id === params.tab);
    if (tab) {
      setActiveTab(tab);
      router.setParams({ tab: undefined });
    }
  }, [params.tab]);

  // Toast triggered by a query param set on redirect back here (e.g. after
  // saving a listing edit).
  useEffect(() => {
    if (params.showUpdateSuccess === 'true') {
      const timer = triggerToast('تم تحديث بيانات الإعلان بنجاح.');
      router.setParams({ showUpdateSuccess: undefined });
      return () => clearTimeout(timer);
    }
  }, [params.showUpdateSuccess, triggerToast]);

  // A draft just saved from the add-ad preview: show it under مسودة
  useEffect(() => {
    if (params.draftSaved === 'true') {
      setActiveTab('ads');
      setActiveFilterId('DRAFT');
      const timer = triggerToast('تم حفظ الاعلان كمسودة بنجاح.');
      router.setParams({ draftSaved: undefined });
      return () => clearTimeout(timer);
    }
  }, [params.draftSaved, triggerToast]);

  // We fetch all listings and filter on the client side to compute dynamic
  // counts
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

  const requestActions = useRequestActions({
    requests: myRequests,
    refetchRequests,
    triggerToast,
  });

  const adActions = useAdActions({
    refetch,
    triggerToast,
    freeAdsRemaining,
    listedAds: sortedAndFilteredData as ActivityItem[],
  });
  const alertActions = useAlertActions({ alerts, refetchAlerts, triggerToast });

  const isAdsTab = activeTab === 'ads';
  const isOffersTab = activeTab === 'offers';
  const isAlertsTab = activeTab === 'alerts';

  // Refresh only the list that's on screen
  const listRefresh = isAlertsTab
    ? { refreshing: isLoadingAlerts, onRefresh: refetchAlerts }
    : isOffersTab
      ? { refreshing: isLoadingRequests, onRefresh: refetchRequests }
      : { refreshing: isLoading, onRefresh: refetch };

  return {
    token,
    activeTab,
    setActiveTab,
    isAdsTab,
    isOffersTab,
    isAlertsTab,
    activeFilterId,
    setActiveFilterId,
    sortBy,
    setSortBy,
    sortSheetRef,
    filterSheetRef,
    listRef,
    listRefresh,
    scrollContentBottomPadding,
    toast: {
      visible: showToast,
      message: toastMessage,
      subtitle: toastSubtitle,
      bottomOffset: tabBarHeight + 40,
      fadeAnim,
      slideAnim,
    },
    ads: {
      isLoading,
      error,
      freeAdsRemaining,
      hasSubscription,
      subscription,
      filterPills,
      items: sortedAndFilteredData,
    },
    alertsError,
    isLoadingAlerts,
    myRequests: requestActions.visibleRequests,
    requestActions,
    requestsError,
    adActions,
    alertActions,
  };
}

export type ActivityScreenState = ReturnType<typeof useActivityScreen>;
