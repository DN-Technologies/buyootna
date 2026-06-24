import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { AddIcon } from '@/assets/icons/tab';
import apiClient from '@/core/api/api';
import ActiveAdCard from '@/core/components/activity/ActiveAdCard';
import ActivityFilterPills from '@/core/components/activity/ActivityFilterPills';
import ActivitySearchBar from '@/core/components/activity/ActivitySearchBar';
import AuthLockView from '@/core/components/activity/AuthLockView';
import DeleteConfirmationSheet from '@/core/components/activity/DeleteConfirmationSheet';
import DraftAdCard from '@/core/components/activity/DraftAdCard';
import DraftPreviewSheet from '@/core/components/activity/DraftPreviewSheet';
import FreeQuotaBanner from '@/core/components/activity/FreeQuotaBanner';
import SubscriptionSlotsRow from '@/core/components/activity/SubscriptionSlotsRow';
import { useMyActivity } from '@/hooks/useMyActivity';
import { useAuthStore } from '@/store/useAuthStore';

const ACTIVITY_TABS = ['اعلاناتي', 'عروضي', 'تنبيهاتي'];

export default function ActivityScreen() {
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Tab Bar height calculation matches CustomTabBar.tsx
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 16);
  const toastBottomOffset = tabBarHeight + 16;

  // Local UI state
  const [activeTab, setActiveTab] = useState('اعلاناتي');
  const [activeFilterId, setActiveFilterId] = useState<
    'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM'
  >('ALL');

  // Bottom sheet reference and current active draft preview property
  const draftSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);

  // References and states for delete confirmation
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Toast notification state and animation
  const params = useLocalSearchParams<{ showUpdateSuccess?: string }>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    'تم تحديث بيانات الإعلان بنجاح.',
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const triggerToast = useCallback(
    (message: string) => {
      setToastMessage(message);
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
      <AuthLockView
        onLoginPress={() => router.push('/(auth)/selection' as any)}
      />
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

  const handleOpenOptions = (propertyId: string) => {
    console.log('Open options for:', propertyId);
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
      Alert.alert('خطأ', msg);
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
      Alert.alert('خطأ', msg);
    }
  };

  const handlePromoAction = () => {
    const route = freeAdsRemaining > 0 ? '/add-listing' : '/packages';
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* --- 1. Top Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="" />
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          نشاطي
        </Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full">
          <AddIcon size={30} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* --- 2. Search Bar --- */}
      <ActivitySearchBar
        onFilterPress={() => console.log('Filter Pressed')}
        onSortPress={() => console.log('Sort Pressed')}
      />

      {/* --- 3. Top Navigation Tabs --- */}
      <View>
        <View className="flex-row justify-around px-5">
          {ACTIVITY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`border-b-2 px-8 pb-2 pt-1 ${activeTab === tab ? 'border-[#15304D]' : 'border-transparent'}`}
            >
              <Text
                className={`text-[15px] ${activeTab === tab ? 'font-cairo-bold text-[#15304D]' : 'font-cairo text-[#6B6A6A]'}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrolling list */}
      <FlatList
        data={activeTab === 'اعلاناتي' ? filteredData : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
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
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#15304D" />
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
              onOptionsPress={() => handleOpenOptions(item.id)}
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

      {/* --- Success Toast Notification --- */}
      {showToast && (
        <Animated.View
          style={{
            bottom: toastBottomOffset,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            elevation: 5,
          }}
          className="absolute left-[20px] right-[20px] z-[999] flex-row-reverse items-center justify-center gap-2.5 rounded-xl border border-[#33D679] bg-white px-4 py-3.5 shadow-lg"
        >
          <Image
            source={require('@/assets/icons/success-icon.svg')}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-right font-cairo-semibold text-[14px] leading-[22px] text-[#111111]">
            {toastMessage}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
