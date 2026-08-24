import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SortingIcon } from '@/assets/icons/activity';
import { FilterHorizontalIcon } from '@/assets/icons/home/header';
import ActiveAdCard from '@/features/individual/components/activity/ActiveAdCard';
import ActivityFilterPills from '@/features/individual/components/activity/ActivityFilterPills';
import DeleteConfirmationSheet from '@/features/individual/components/activity/DeleteConfirmationSheet';
import DraftAdCard from '@/features/individual/components/activity/DraftAdCard';
import DraftPreviewSheet from '@/features/individual/components/activity/DraftPreviewSheet';
import FeatureAdSheet from '@/features/individual/components/activity/FeatureAdSheet';
import FreeQuotaBanner from '@/features/individual/components/activity/FreeQuotaBanner';
import SubscriptionSlotsRow from '@/features/individual/components/activity/SubscriptionSlotsRow';
import { useMyActivity } from '@/features/individual/hooks/useMyActivity';
import { useTabBarHeight } from '@/features/individual/hooks/useTabBarHeight';
import apiClient from '@/shared/api/api';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import RadioSelectionSheet, {
  RadioOption,
} from '@/shared/components/profile/RadioSelectionSheet';
import ActivityCardSkeleton from '@/shared/components/skeletons/ActivityCardSkeleton';
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
  const [activeFilterId, setActiveFilterId] = useState<
    'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM'
  >('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>(
    'NEWEST',
  );

  const sortSheetRef = useRef<BottomSheetModal>(null);

  const handleSortPress = () => {
    sortSheetRef.current?.present();
  };

  const handleTrashPress = () => {
    setPropertyToDelete(null);
    deleteSheetRef.current?.present();
  };

  // Bottom sheet reference and current active draft preview property
  const draftSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);

  // References and states for delete confirmation
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // References and states for featuring ads
  const featureAdSheetRef = useRef<BottomSheetModal>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // Toast notification state and animation
  const params = useLocalSearchParams<{ showUpdateSuccess?: string }>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    'تم تحديث بيانات الإعلان بنجاح.',
  );
  const [toastSubtitle, setToastSubtitle] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const triggerToast = useCallback(
    (message: string, subtitle?: string | null) => {
      setToastMessage(message);
      setToastSubtitle(subtitle || null);
      setShowToast(true);

      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(40);

      // Animate In
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Hide after 3.5 seconds
      const timer = setTimeout(() => {
        // Animate Out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowToast(false);
        });
      }, 3500);

      return timer;
    },
    [fadeAnim, slideAnim],
  );

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

  // Handle redirect to login if unauthenticated
  if (!token) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']}
      >
        {/* --- 1. Top Header --- */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View className="w-10" />
          <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
            نشاطي
          </Text>
          <View className="w-10" />
        </View>
        <GuestEmptyState
          icon="send"
          title="ابدأ رحلتك العقارية"
          description="سجل حسابك لإدارة الإعلانات والتنبيهات وعروض الأسعار الخاصة بك"
        />
      </SafeAreaView>
    );
  }

  // Dynamic counts for filter pills
  const allCount = data.length;
  const activeCount = data.filter((item) => item.status === 'ACTIVE').length;
  const draftCount = data.filter((item) => item.status === 'DRAFT').length;
  const premiumCount = data.filter((item) => item.isPremium).length;

  const filterPills: {
    id: 'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM';
    label: string;
  }[] = [
    { id: 'DRAFT', label: `مسودة (${draftCount})` },
    { id: 'PREMIUM', label: `مميزة (${premiumCount})` },
    { id: 'ACTIVE', label: `نشطة (${activeCount})` },
    { id: 'ALL', label: `الكل (${allCount})` },
  ];

  // Client-side filtering of properties
  const filteredData =
    activeFilterId === 'ALL'
      ? data
      : activeFilterId === 'PREMIUM'
        ? data.filter((item) => item.isPremium)
        : data.filter((item) => item.status === activeFilterId);

  // Apply sorting
  const sortedAndFilteredData = [...filteredData].sort((a: any, b: any) => {
    if (sortBy === 'PRICE_ASC') return a.price - b.price;
    if (sortBy === 'PRICE_DESC') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleEditAd = (propertyId: string) => {
    console.log('Edit ad:', propertyId);
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

  const handlePublishDraft = (property: any) => {
    setSelectedDraft(property);
    draftSheetRef.current?.present();
  };

  const handleDeleteDraft = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    deleteSheetRef.current?.present();
  };

  const handleConfirmDelete = async (reason?: string) => {
    if (!propertyToDelete) return;
    try {
      console.log(
        `Deleting listing ${propertyToDelete} with reason: ${reason}`,
      );
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
      {/* --- 1. Top Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4">
        {/* Trash Button */}
        <TouchableOpacity
          onPress={handleTrashPress}
          className="h-10 w-10 items-center justify-start rounded-full"
        >
          <Feather name="trash-2" size={24} color="#B91C1C" />
        </TouchableOpacity>

        {/* Centered Title */}
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          نشاطي
        </Text>

        {/* Plus Button */}
        <TouchableOpacity
          onPress={() => router.push('/add-listing')}
          className="h-10 w-10 items-center justify-end rounded-full"
        >
          <Feather name="plus" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Tabs & Controls Row */}
      <View className="mb-4 flex-row items-center gap-2 px-5">
        {/* Tab Pill Container */}
        <View className="h-[45px] flex-1 flex-row items-center justify-between rounded-full border border-gray-100 bg-[#F8FAFC] px-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
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
                    {tab}
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
          onPress={() => {
            setActiveFilterId((prev) => (prev === 'ALL' ? 'ACTIVE' : 'ALL'));
          }}
          className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
        >
          <FilterHorizontalIcon size={18} color="#111111" />
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSortPress}
          className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
        >
          <SortingIcon size={18} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Scrolling list */}
      <FlashList
        data={activeTab === 'اعلاناتي' ? sortedAndFilteredData : []}
        keyExtractor={(item) => item.id}
        getItemType={(item) => (item.status === 'DRAFT' ? 'draft' : 'active')}
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
        // Render List Header (Filters & Quota Banner)
        ListHeaderComponent={
          activeTab === 'اعلاناتي' ? (
            <View style={{ width: '100%' }}>
              {/* --- 4. Filter Pills --- */}
              <ActivityFilterPills
                filterPills={filterPills}
                activeFilterId={activeFilterId}
                onFilterChange={setActiveFilterId}
              />

              {/* --- 5. Dynamic Quota Banner or Subscription Slots --- */}
              {hasSubscription ? (
                <SubscriptionSlotsRow subscription={subscription} />
              ) : (
                <FreeQuotaBanner
                  freeAdsRemaining={freeAdsRemaining}
                  onPressAction={handlePromoAction}
                />
              )}
            </View>
          ) : null
        }
        // Render Empty State
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3].map((key) => (
                <ActivityCardSkeleton key={key} />
              ))}
            </View>
          ) : error ? (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-red-500">{error}</Text>
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="font-cairo-medium text-gray-400">
                لا توجد إعلانات حالياً
              </Text>
            </View>
          )
        }
        // --- Render the Cards based on Status ---
        renderItem={({ item }) => {
          if (item.status === 'DRAFT') {
            return (
              <DraftAdCard
                property={item}
                onPublishPress={() => handlePublishDraft(item)}
                onDeletePress={() => handleDeleteDraft(item.id)}
              />
            );
          }

          return (
            <ActiveAdCard
              property={item}
              onEditPress={handleEditAd}
              onFeaturePress={handleFeatureAd}
              onDeletePress={handleDeleteAd}
            />
          );
        }}
      />

      {/* --- Property Preview Bottom Sheet --- */}
      <DraftPreviewSheet
        ref={draftSheetRef}
        property={selectedDraft}
        onDeletePress={() => handleDeleteDraft(selectedDraft?.id)}
        onPublishPress={handlePublishDraftAction}
        onEditPress={() => console.log('Edit draft:', selectedDraft?.id)}
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
      {showToast && (
        <Animated.View
          style={{
            bottom: toastBottomOffset,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            elevation: 5,
          }}
          className="absolute left-[20px] right-[20px] z-[999] flex-row items-center justify-between rounded-xl border border-[#33D679] bg-white px-4 py-3.5 shadow-lg"
        >
          <View className="flex-row items-center gap-2.5">
            <Image
              source={require('@/assets/icons/success-icon.svg')}
              style={{ width: 24, height: 24 }}
            />
            <View className="items-start">
              <Text
                className="font-cairo-semibold text-[14px] leading-[22px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {toastMessage}
              </Text>
              {toastSubtitle && (
                <Text
                  className="mt-0.5 font-cairo text-[12px] leading-[18px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {toastSubtitle}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
