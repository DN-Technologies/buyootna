import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

import apiClient from '@/shared/api/api';
import { ActivityItem } from '@/shared/hooks/useMyActivity';
import { showAlert } from '@/shared/utils/alert';

interface UseAdActionsParams {
  refetch: () => unknown;
  triggerToast: (message: string, subtitle?: string | null) => unknown;
  freeAdsRemaining: number;
}

// State, sheet refs and handlers for the "اعلاناتي" tab: edit, feature,
// delete, and publishing drafts.
export function useAdActions({
  refetch,
  triggerToast,
  freeAdsRemaining,
}: UseAdActionsParams) {
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

  // Header "⋮" menu opens the delete sheet with no property selected
  const handleMenuPress = () => {
    setPropertyToDelete(null);
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

  return {
    draftSheetRef,
    deleteSheetRef,
    featureAdSheetRef,
    selectedDraft,
    selectedPropertyId,
    handleEditAd,
    handleFeatureAd,
    handleDeleteAd,
    handleMenuPress,
    handleFeatureSuccess,
    handlePublishDraft,
    handleConfirmDelete,
    handleCancelDelete,
    handlePublishDraftAction,
    handlePromoAction,
  };
}
