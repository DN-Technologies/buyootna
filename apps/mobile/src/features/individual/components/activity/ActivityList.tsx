import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { RefreshControl } from 'react-native';

import type { CompanyRequestItem } from '@/features/company/components/requests/types';
import ActivityEmptyState from '@/features/individual/components/activity/ActivityEmptyState';
import ActivityListHeader from '@/features/individual/components/activity/ActivityListHeader';
import ActivityListItem from '@/features/individual/components/activity/ActivityListItem';
import AlertListItem from '@/features/individual/components/activity/alerts/AlertListItem';
import AlertsEmptyState from '@/features/individual/components/activity/alerts/AlertsEmptyState';
import AlertsListHeader from '@/features/individual/components/activity/alerts/AlertsListHeader';
import MyRequestListItem from '@/features/individual/components/activity/offers/MyRequestListItem';
import OffersListHeader from '@/features/individual/components/activity/offers/OffersListHeader';
import type { ActivityScreenState } from '@/features/individual/hooks/useActivityScreen';
import { AlertItem } from '@/shared/api/alerts.service';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';
import { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

/** The scrolling list of the active نشاطي tab (ads / offers / alerts). */
export default function ActivityList({
  screen,
}: {
  screen: ActivityScreenState;
}) {
  const {
    listRef,
    isAdsTab,
    isOffersTab,
    isAlertsTab,
    activeFilterId,
    setActiveFilterId,
    listRefresh,
    scrollContentBottomPadding,
    ads,
    alertActions,
    adActions,
    isLoadingAlerts,
    alertsError,
    myRequests,
    requestActions,
    requestsError,
  } = screen;

  return (
    <FlashList
      ref={listRef}
      data={
        isAdsTab
          ? ads.items
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
        // عروضي follows its Figma frame: 16px side margins, 12px under the tabs
        paddingHorizontal: isOffersTab ? 16 : 20,
        paddingBottom: scrollContentBottomPadding,
        paddingTop: isOffersTab ? 12 : 16,
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
            filterPills={ads.filterPills}
            activeFilterId={activeFilterId}
            onFilterChange={setActiveFilterId}
            hasSubscription={ads.hasSubscription}
            subscription={ads.subscription}
            freeAdsRemaining={ads.freeAdsRemaining}
            onPromoPress={adActions.handlePromoAction}
          />
        ) : isAlertsTab &&
          alertActions.displayedAlerts &&
          alertActions.displayedAlerts.length > 0 ? (
          <AlertsListHeader
            allPaused={alertActions.allAlertsPaused}
            onToggleAll={alertActions.handleToggleAllAlerts}
          />
        ) : isOffersTab ? (
          <OffersListHeader
            pills={requestActions.pills}
            activeStatus={requestActions.status}
            onStatusChange={requestActions.setStatus}
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
            isLoading={ads.isLoading}
            error={ads.error}
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
            onPress={() =>
              alertActions.handleOpenAlertDetails(item as AlertItem)
            }
          />
        ) : isOffersTab ? (
          <MyRequestListItem request={item as CompanyRequestItem} />
        ) : (
          <ActivityListItem
            property={item as ActivityItem}
            activeFilterId={activeFilterId}
            onDeletePress={adActions.handleDeleteAd}
            onPublishDraftPress={adActions.handlePublishDraft}
            onOpenAdPress={adActions.handleOpenAd}
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
  );
}
