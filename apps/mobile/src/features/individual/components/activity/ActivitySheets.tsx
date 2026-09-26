import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { RefObject } from 'react';

import AlertDetailsSheet from '@/features/individual/components/activity/AlertDetailsSheet';
import {
  AD_SORT_OPTIONS,
  type AdSortBy,
} from '@/features/individual/components/activity/constants';
import DeleteAllAlertsSheet from '@/features/individual/components/activity/DeleteAllAlertsSheet';
import DeleteConfirmationSheet from '@/features/individual/components/activity/DeleteConfirmationSheet';
import DraftPreviewSheet from '@/features/individual/components/activity/DraftPreviewSheet';
import FeatureAdSheet from '@/features/individual/components/activity/FeatureAdSheet';
import type { useAdActions } from '@/features/individual/hooks/useAdActions';
import type { useAlertActions } from '@/features/individual/hooks/useAlertActions';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';

export interface ActivitySheetsProps {
  adActions: ReturnType<typeof useAdActions>;
  alertActions: ReturnType<typeof useAlertActions>;
  sortSheetRef: RefObject<BottomSheetModal | null>;
  sortBy: AdSortBy;
  onSortChange: (sortBy: AdSortBy) => void;
}

// All bottom sheets of the activity screen
export default function ActivitySheets({
  adActions,
  alertActions,
  sortSheetRef,
  sortBy,
  onSortChange,
}: ActivitySheetsProps) {
  const { selectedDraft } = adActions;

  return (
    <>
      {/* --- Property Preview Bottom Sheet --- */}
      <DraftPreviewSheet
        ref={adActions.draftSheetRef}
        property={selectedDraft}
        onDeletePress={() =>
          selectedDraft && adActions.handleDeleteAd(selectedDraft.id)
        }
        onPublishPress={adActions.handlePublishDraftAction}
        onEditPress={() => {}}
      />

      {/* --- Delete Confirmation Bottom Sheet --- */}
      <DeleteConfirmationSheet
        ref={adActions.deleteSheetRef}
        onConfirm={adActions.handleConfirmDelete}
        onCancel={adActions.handleCancelDelete}
      />

      {/* --- Alert Delete Confirmation Bottom Sheet --- */}
      <DeleteConfirmationSheet
        ref={alertActions.alertDeleteSheetRef}
        onConfirm={alertActions.handleConfirmDeleteAlert}
        onCancel={alertActions.handleCancelDeleteAlert}
        title="هل أنت متأكد من حذف التنبيه؟"
        description="لن تصلك إشعارات بعد الآن بخصوص هذا التنبيه"
        confirmLabel="حذف التنبيه"
        skipReasonStep
      />

      {/* --- Delete All Alerts Confirmation Bottom Sheet --- */}
      <DeleteAllAlertsSheet
        ref={alertActions.deleteAllAlertsSheetRef}
        onConfirm={alertActions.handleConfirmDeleteAllAlerts}
        onCancel={alertActions.handleCancelDeleteAllAlerts}
      />

      {/* --- Alert Details Bottom Sheet (Auctions & Properties) --- */}
      <AlertDetailsSheet
        ref={alertActions.alertDetailsSheetRef}
        alert={alertActions.selectedAlertForDetails}
        isActive={
          alertActions.selectedAlertForDetails
            ? alertActions.isAlertActive(alertActions.selectedAlertForDetails.id)
            : true
        }
        onToggleActive={alertActions.handleToggleAlertActive}
        onClose={alertActions.handleCloseAlertDetails}
        onDeletePress={alertActions.handleDeleteFromDetails}
        onEditPress={(alert) => {
          alertActions.handleCloseAlertDetails();
          router.push({ pathname: '/add-alert', params: { editId: alert.id } });
        }}
        onViewMatchesPress={(alert) => {
          alertActions.handleCloseAlertDetails();
          router.push(`/alert-matches/${alert.id}` as any);
        }}
      />

      {/* --- Feature Ad Bottom Sheet --- */}
      <FeatureAdSheet
        ref={adActions.featureAdSheetRef}
        propertyId={adActions.selectedPropertyId || undefined}
        onSuccess={adActions.handleFeatureSuccess}
      />

      {/* --- Sort Ads Bottom Sheet --- */}
      <RadioSelectionSheet
        ref={sortSheetRef}
        title="الترتيب حسب"
        options={AD_SORT_OPTIONS}
        selectedValue={sortBy}
        onSelect={(value) => onSortChange(value as AdSortBy)}
        snapPoints={['40%']}
      />
    </>
  );
}
