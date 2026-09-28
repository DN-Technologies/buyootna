import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

import apiClient from '@/shared/api/api';
import { ActivityItem } from '@/shared/hooks/useMyActivity';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

const MY_ACTIVITY_KEY = ['myActivity'];

type MyActivityCache = { activity: ActivityItem[] } | undefined;

interface UseAdActionsParams {
  refetch: () => unknown;
  triggerToast: (message: string, subtitle?: string | null) => unknown;
  freeAdsRemaining: number;
  // The ads currently listed on the tab (after the filter pill), which is
  // what "delete all" from the header menu removes
  listedAds?: ActivityItem[];
}

// State, sheet refs and handlers for the "اعلاناتي" tab: edit, feature,
// delete, and publishing drafts.
export function useAdActions({
  refetch,
  triggerToast,
  freeAdsRemaining,
  listedAds = [],
}: UseAdActionsParams) {
  const queryClient = useQueryClient();

  const draftSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDraft, setSelectedDraft] = useState<ActivityItem | undefined>(
    undefined,
  );

  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
    null,
  );

  const deleteAllSheetRef = useRef<BottomSheetModal>(null);
  const toggleVisibilitySheetRef = useRef<BottomSheetModal>(null);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);

  const featureAdSheetRef = useRef<BottomSheetModal>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const allHidden =
    listedAds.length > 0 && listedAds.every((p) => Boolean(p.isHidden));

  const handleEditAd = (propertyId: string) => {
    // The dedicated edit screen: pre-filled, with the fields that can't
    // change after publishing locked. /add-listing is the create flow.
    router.push(`/edit-listing/${propertyId}`);
  };

  const handleFeatureAd = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    featureAdSheetRef.current?.present();
  };

  const handleDeleteAd = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    deleteSheetRef.current?.present();
  };

  // Header "⋮" opens the ads options menu (delete all listed ads)
  const handleMenuPress = () => {
    setIsOptionsMenuVisible(true);
  };

  const handleCloseOptionsMenu = () => {
    setIsOptionsMenuVisible(false);
  };

  const handlePromptToggleVisibility = () => {
    setIsOptionsMenuVisible(false);
    if (listedAds.length === 0) return;
    toggleVisibilitySheetRef.current?.present();
  };

  const handlePromptDeleteAll = () => {
    setIsOptionsMenuVisible(false);
    if (listedAds.length === 0) return;
    deleteAllSheetRef.current?.present();
  };

  // Drops ads from every cached My Activity list right away so they vanish
  // as the sheet closes; returns the previous caches to restore on failure
  const removeFromCache = (ids: string[]) => {
    const snapshot = queryClient.getQueriesData<MyActivityCache>({
      queryKey: MY_ACTIVITY_KEY,
    });
    queryClient.setQueriesData<MyActivityCache>(
      { queryKey: MY_ACTIVITY_KEY },
      (old) =>
        old && {
          ...old,
          activity: old.activity.filter((p) => !ids.includes(p.id)),
        },
    );
    return () =>
      snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
  };

  // Optimistically updates isHidden on listed ads in query cache
  const updateHiddenInCache = (ids: string[], isHidden: boolean) => {
    const snapshot = queryClient.getQueriesData<MyActivityCache>({
      queryKey: MY_ACTIVITY_KEY,
    });
    queryClient.setQueriesData<MyActivityCache>(
      { queryKey: MY_ACTIVITY_KEY },
      (old) =>
        old && {
          ...old,
          activity: old.activity.map((p) =>
            ids.includes(p.id) ? { ...p, isHidden } : p,
          ),
        },
    );
    return () =>
      snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
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
    const propertyId = propertyToDelete;
    setPropertyToDelete(null);
    if (!propertyId) {
      // Never close the sheet as if something happened when nothing did
      showAlert('خطأ', 'تعذر تحديد الإعلان المراد حذفه. حاول مرة أخرى.');
      return;
    }
    const restore = removeFromCache([propertyId]);
    try {
      await apiClient.delete(`/properties/${propertyId}`, {
        data: reason ? { reason } : undefined,
      });
      triggerToast('تم حذف الاعلان بنجاح.');
    } catch (err) {
      console.error('Error deleting property:', err);
      restore();
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف الإعلان'));
    } finally {
      refetch();
    }
  };

  const handleConfirmDeleteAll = async () => {
    const ids = listedAds.map((p) => p.id);
    if (ids.length === 0) return;
    const restore = removeFromCache(ids);
    const results = await Promise.allSettled(
      ids.map((id) => apiClient.delete(`/properties/${id}`)),
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed === 0) {
      triggerToast('تم حذف جميع الإعلانات بنجاح.');
    } else {
      // Put the list back; the refetch below removes the ones that did go
      restore();
      showAlert(
        'خطأ',
        failed === ids.length
          ? 'فشل في حذف الإعلانات'
          : `تعذر حذف ${failed} من ${ids.length} إعلانات`,
      );
    }
    refetch();
  };

  const handleConfirmToggleVisibility = async () => {
    const ids = listedAds.map((p) => p.id);
    if (ids.length === 0) return;
    const targetIsHidden = !allHidden;
    const restore = updateHiddenInCache(ids, targetIsHidden);
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          apiClient.patch(`/properties/${id}`, { isHidden: targetIsHidden }),
        ),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed === 0) {
        triggerToast(
          targetIsHidden
            ? 'تم إخفاء جميع الإعلانات بنجاح'
            : 'تم إظهار جميع الإعلانات بنجاح',
        );
      } else {
        restore();
        showAlert(
          'خطأ',
          failed === ids.length
            ? 'فشل في تحديث حالة الإعلانات'
            : `تعذر تحديث حالة ${failed} من ${ids.length} إعلانات`,
        );
      }
    } catch (err) {
      restore();
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في تحديث حالة الإعلانات'));
    } finally {
      refetch();
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

  return {
    draftSheetRef,
    deleteSheetRef,
    deleteAllSheetRef,
    featureAdSheetRef,
    toggleVisibilitySheetRef,
    isOptionsMenuVisible,
    listedAdsCount: listedAds.length,
    allHidden,
    selectedDraft,
    selectedPropertyId,
    handleEditAd,
    handleFeatureAd,
    handleDeleteAd,
    handleMenuPress,
    handleCloseOptionsMenu,
    handlePromptDeleteAll,
    handleConfirmDeleteAll,
    handlePromptToggleVisibility,
    handleConfirmToggleVisibility,
    handleFeatureSuccess,
    handlePublishDraft,
    handleConfirmDelete,
    handleCancelDelete,
    handlePublishDraftAction,
    handlePromoAction,
  };
}
