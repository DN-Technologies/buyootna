import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityEmptyState from '@/features/individual/components/activity/ActivityEmptyState';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import ActivityListHeader from '@/features/individual/components/activity/ActivityListHeader';
import ActivityListItem from '@/features/individual/components/activity/ActivityListItem';
import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ActivityTabsRow from '@/features/individual/components/activity/ActivityTabsRow';
import DeleteConfirmationSheet from '@/features/individual/components/activity/DeleteConfirmationSheet';
import DraftPreviewSheet from '@/features/individual/components/activity/DraftPreviewSheet';
import FeatureAdSheet from '@/features/individual/components/activity/FeatureAdSheet';
import { useActivityFilters } from '@/features/individual/hooks/useActivityFilters';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { ActivityItem, useMyActivity } from '@/features/individual/hooks/useMyActivity';
import { useTabBarHeight } from '@/features/individual/hooks/useTabBarHeight';
import apiClient from '@/shared/api/api';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import RadioSelectionSheet, {
  RadioOption,
} from '@/shared/components/profile/RadioSelectionSheet';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

const AD_SORT_OPTIONS: RadioOption[] = [
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'السعر: من الأعلى إلى الأقل', value: 'PRICE_DESC' },
  { label: 'السعر: من الأقل إلى الأعلى', value: 'PRICE_ASC' },
];

const TABS = ['اعلاناتي', 'عروضي', 'تنبيهاتي'];

export default function ActivityScreen() {
  const { token } = useAuthStore();
  const { tabBarHeight, scrollContentBottomPadding } = useTabBarHeight();
  const toastBottomOffset = tabBarHeight + 40;

  // Local UI state
  const [activeTab, setActiveTab] = useState('اعلاناتي');
  const [activeFilterId, setActiveFilterId] =
    useState<ActivityFilterType>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>(
    'NEWEST',
  );

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const draftSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDraft, setSelectedDraft] = useState<ActivityItem | undefined>(
    undefined,
  );

  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
    null,
  );

  const featureAdSheetRef = useRef<BottomSheetModal>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

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

  // Refetch on every focus -- the global 30s React Query staleTime means a
  // simple remount alone doesn't guarantee fresh data, so freeAdsRemaining
  // (and the ad list) could still show a value that's already out of date
  // by the time the user checks here vs. the Add Ad flow, which always
  // reads the live value directly (bypasses the query cache entirely).
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
      }
    }, [token, refetch]),
  );

  const { filterPills, sortedAndFilteredData } = useActivityFilters(
    data,
    activeFilterId,
    sortBy,
  );

  // Handle redirect to login if unauthenticated
  if (!token) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']}
      >
        <ActivityHeader
          onAddPress={() => router.push('/add-listing')}
          onMenuPress={() => {
            setPropertyToDelete(null);
            deleteSheetRef.current?.present();
          }}
        />
        <GuestEmptyState
          icon="send"
          title="ابدأ رحلتك العقارية"
          description="سجل حسابك لإدارة الإعلانات والتنبيهات وعروض الأسعار الخاصة بك"
        />
      </SafeAreaView>
    );
  }

  const handleEditAd = (propertyId: string) => {
    router.push({
      pathname: '/add-listing',
      params: { editId: propertyId },
    });
  };

  const handleFeatureAd = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    featureAdSheetRef.current?.present();
  };

  const handleDeleteAd = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    deleteSheetRef.current?.present();
  };

  const handleFeatureSuccess = () => {
    triggerToast('تم تمييز إعلانك بنجاح', 'تم تفعيل التميز لهذا الإعلان');
    refetch();
  };

  const handlePublishDraft = (property: ActivityItem) => {
    setSelectedDraft(property);
    draftSheetRef.current?.present();
  };

  const handleConfirmDelete = async (reason?: string) => {
    if (!propertyToDelete) return;
    try {
      await apiClient.delete(`/properties/${propertyToDelete}`, {
        data: reason ? { reason } : undefined,
      });
      triggerToast('تم حذف الاعلان بنجاح.');
      refetch();
    } catch (err: any) {
      console.error('Error deleting property:', err);
      const msg = err.response?.data?.message || 'فشل في حذف الإعلان';
      showAlert('خطأ', msg);
    } finally {
      setPropertyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPropertyToDelete(null);
  };

  const handlePublishDraftAction = async (propertyId: string) => {
    try {
      await apiClient.patch(`/properties/${propertyId}`, { isDraft: false });
      triggerToast('تم نشر الإعلان بنجاح.');
      refetch();
    } catch (err: any) {
      console.error('Error publishing draft:', err);
      const msg = err.response?.data?.message || 'فشل في نشر الإعلان';
      showAlert('خطأ', msg);
    }
  };

  const handlePromoAction = () => {
    const route = freeAdsRemaining > 0 ? '/add-listing' : '/plans';
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ActivityHeader
        onAddPress={() => router.push('/add-listing')}
        onMenuPress={() => {
          setPropertyToDelete(null);
          deleteSheetRef.current?.present();
        }}
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
        data={activeTab === 'اعلاناتي' ? sortedAndFilteredData : []}
        keyExtractor={(item) => item.id}
        getItemType={(item) =>
          item.status === 'DRAFT'
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
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#15304D"
          />
        }
        ListHeaderComponent={
          activeTab === 'اعلاناتي' ? (
            <ActivityListHeader
              filterPills={filterPills}
              activeFilterId={activeFilterId}
              onFilterChange={setActiveFilterId}
              hasSubscription={hasSubscription}
              subscription={subscription}
              freeAdsRemaining={freeAdsRemaining}
              onPromoPress={handlePromoAction}
            />
          ) : null
        }
        ListEmptyComponent={
          <ActivityEmptyState
            isLoading={isLoading}
            error={error}
            activeFilterId={activeFilterId}
          />
        }
        renderItem={({ item }) => (
          <ActivityListItem
            property={item}
            activeFilterId={activeFilterId}
            onEditPress={handleEditAd}
            onFeaturePress={handleFeatureAd}
            onDeletePress={handleDeleteAd}
            onPublishDraftPress={handlePublishDraft}
            onArchivedPress={(id) => router.push(`/property/${id}` as any)}
          />
        )}
      />

      {/* --- Property Preview Bottom Sheet --- */}
      <DraftPreviewSheet
        ref={draftSheetRef}
        property={selectedDraft}
        onDeletePress={() =>
          selectedDraft && handleDeleteAd(selectedDraft.id)
        }
        onPublishPress={handlePublishDraftAction}
        onEditPress={() => {}}
      />

      {/* --- Delete Confirmation Bottom Sheet --- */}
      <DeleteConfirmationSheet
        ref={deleteSheetRef}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* --- Feature Ad Bottom Sheet --- */}
      <FeatureAdSheet
        ref={featureAdSheetRef}
        propertyId={selectedPropertyId || undefined}
        onSuccess={handleFeatureSuccess}
      />

      {/* --- Sort Ads Bottom Sheet --- */}
      <RadioSelectionSheet
        ref={sortSheetRef}
        title="الترتيب حسب"
        options={AD_SORT_OPTIONS}
        selectedValue={sortBy}
        onSelect={(value) => setSortBy(value as typeof sortBy)}
        snapPoints={['40%']}
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
