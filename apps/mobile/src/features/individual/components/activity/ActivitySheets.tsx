import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { RefObject } from 'react';

import type {
  ActivityFilterType,
  FilterPill,
} from '@/features/individual/components/activity/ActivityFilterPills';
import AdPreviewSheet from '@/features/individual/components/activity/ads/AdPreviewSheet';
import FeatureAdSheet from '@/features/individual/components/activity/ads/FeatureAdSheet';
import ToggleAdsVisibilitySheet from '@/features/individual/components/activity/ads/ToggleAdsVisibilitySheet';
import AlertDetailsSheet from '@/features/individual/components/activity/alerts/AlertDetailsSheet';
import DeleteAllAlertsSheet from '@/features/individual/components/activity/alerts/DeleteAllAlertsSheet';
import {
  AD_SORT_OPTIONS,
  type AdSortBy,
} from '@/features/individual/components/activity/constants';
import DeleteConfirmationSheet from '@/features/individual/components/activity/delete-confirmation/DeleteConfirmationSheet';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import {
  OffersFilterSheet,
  OffersSortSheet,
} from '@/features/individual/components/activity/offers/OffersPickerSheets';
import type { useRequestActions } from '@/features/individual/hooks/useRequestActions';
import { TrashLargeIcon } from '@/assets/icons/activity';
import type { useAdActions } from '@/features/individual/hooks/useAdActions';
import type { useAlertActions } from '@/features/individual/hooks/useAlertActions';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';

export interface ActivitySheetsProps {
  adActions: ReturnType<typeof useAdActions>;
  alertActions: ReturnType<typeof useAlertActions>;
  requestActions: ReturnType<typeof useRequestActions>;
  sortSheetRef: RefObject<BottomSheetModal | null>;
  sortBy: AdSortBy;
  onSortChange: (sortBy: AdSortBy) => void;
  filterSheetRef: RefObject<BottomSheetModal | null>;
  filterPills: FilterPill[];
  activeFilterId: ActivityFilterType;
  onFilterChange: (id: ActivityFilterType) => void;
}

// All bottom sheets of the activity screen
export default function ActivitySheets({
  adActions,
  alertActions,
  requestActions,
  sortSheetRef,
  sortBy,
  onSortChange,
  filterSheetRef,
  filterPills,
  activeFilterId,
  onFilterChange,
}: ActivitySheetsProps) {
  const { selectedDraft } = adActions;

  return (
    <>
      {/* --- Property Preview Bottom Sheet --- */}
      <AdPreviewSheet
        ref={adActions.draftSheetRef}
        property={selectedDraft}
        onDeletePress={() =>
          selectedDraft && adActions.handleDeleteAd(selectedDraft.id)
        }
        onPublishPress={adActions.handlePublishDraftAction}
        onEditPress={() => {}}
      />

      {/* --- Active / hidden ad: details, edit, feature, delete --- */}
      <AdPreviewSheet
        ref={adActions.adSheetRef}
        variant="active"
        property={adActions.selectedAd}
        onEditPress={() => {}}
        onFeaturePress={adActions.handleFeatureAd}
        onDeletePress={() =>
          adActions.selectedAd &&
          adActions.handleDeleteAd(adActions.selectedAd.id)
        }
        onSharePress={adActions.handleShareSelectedAd}
        onToggleVisibility={adActions.handleToggleAdVisibility}
      />

      {/* --- Delete Confirmation Bottom Sheet --- */}
      <DeleteConfirmationSheet
        ref={adActions.deleteSheetRef}
        onConfirm={adActions.handleConfirmDelete}
        onCancel={adActions.handleCancelDelete}
      />

      {/* --- Delete All Ads Confirmation (header "⋮" menu) --- */}
      <DeleteConfirmationSheet
        ref={adActions.deleteAllSheetRef}
        onConfirm={adActions.handleConfirmDeleteAll}
        title="هل أنت متأكد من حذف جميع الإعلانات؟"
        description={`سيتم حذف ${adActions.listedAdsCount} إعلان ولن تظهر للمستخدمين بعد الآن، وسيتم فقدان مدة التميز المتبقية`}
        confirmLabel="حذف جميع الإعلانات"
        skipReasonStep
      />

      {/* --- Toggle Ads Visibility Bottom Sheet --- */}
      <ToggleAdsVisibilitySheet
        ref={adActions.toggleVisibilitySheetRef}
        mode={adActions.allHidden ? 'show' : 'hide'}
        onConfirm={adActions.handleConfirmToggleVisibility}
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

      {/* --- عروضي: sort, service filter and delete-all --- */}
      <OffersSortSheet
        ref={requestActions.sortSheetRef}
        value={requestActions.sort}
        onChange={requestActions.setSort}
      />
      <OffersFilterSheet
        ref={requestActions.filterSheetRef}
        categories={requestActions.categories}
        selected={requestActions.selectedCategories}
        onChange={requestActions.setSelectedCategories}
      />
      <ConfirmActionSheet
        ref={requestActions.deleteAllSheetRef}
        variant="danger"
        icon={<TrashLargeIcon />}
        iconBackground="#FFEBEB"
        title="هل أنت متأكد من حذف جميع عروضك؟"
        description="سيتم حذف جميع عروضك،ولن تتمكن الشركات من التواصل."
        confirmLabel="حذف العروض"
        onConfirm={requestActions.handleConfirmDeleteAll}
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

      {/* --- Filter Ads Bottom Sheet (تصفية البحث) --- */}
      <RadioSelectionSheet
        ref={filterSheetRef}
        title="تصفية البحث"
        options={filterPills.map((pill) => ({
          label: pill.label,
          value: pill.id,
        }))}
        selectedValue={activeFilterId}
        onSelect={(value) => onFilterChange(value as ActivityFilterType)}
        snapPoints={['50%']}
      />
    </>
  );
}
