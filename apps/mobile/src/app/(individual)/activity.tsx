import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityGuestView from '@/features/individual/components/activity/ActivityGuestView';
import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import ActivityList from '@/features/individual/components/activity/ActivityList';
import ActivitySheets from '@/features/individual/components/activity/ActivitySheets';
import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ActivityTabsRow from '@/features/individual/components/activity/ActivityTabsRow';
import AdsOptionsMenu from '@/features/individual/components/activity/ads/AdsOptionsMenu';
import AlertDeleteToast from '@/features/individual/components/activity/alerts/AlertDeleteToast';
import AlertsOptionsMenu from '@/features/individual/components/activity/alerts/AlertsOptionsMenu';
import {
  ADD_ROUTE_BY_TAB,
  TABS,
} from '@/features/individual/components/activity/constants';
import { useActivityScreen } from '@/features/individual/hooks/useActivityScreen';

export default function ActivityScreen() {
  const screen = useActivityScreen();
  const {
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
    toast,
    ads,
    adActions,
    alertActions,
  } = screen;

  // Handle redirect to login if unauthenticated. Must stay below every hook.
  if (!token) {
    return <ActivityGuestView onMenuPress={adActions.handleMenuPress} />;
  }

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

      <ActivityList screen={screen} />

      <ActivitySheets
        adActions={adActions}
        alertActions={alertActions}
        sortSheetRef={sortSheetRef}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterSheetRef={filterSheetRef}
        filterPills={ads.filterPills}
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

      <ActivitySuccessToast
        visible={toast.visible}
        message={toast.message}
        subtitle={toast.subtitle}
        bottomOffset={toast.bottomOffset}
        fadeAnim={toast.fadeAnim}
        slideAnim={toast.slideAnim}
      />

      <AlertDeleteToast
        visible={alertActions.isDeleteToastVisible}
        onUndo={alertActions.handleUndoDeleteAlert}
        onDismiss={alertActions.handleDismissDeleteToast}
      />
    </SafeAreaView>
  );
}
