import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { HideEyeIcon, ShowEyeIcon, TrashLargeIcon } from '@/assets/icons/activity';
import AdPreviewSheet from '@/features/individual/components/activity/ads/AdPreviewSheet';
import FeatureAdSheet from '@/features/individual/components/activity/ads/FeatureAdSheet';
import DeleteConfirmationSheet from '@/features/individual/components/activity/delete-confirmation/DeleteConfirmationSheet';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import type { useAdActions } from '@/features/individual/hooks/useAdActions';

import { markDoneLabel } from '../officeProperties';

/** The confirmations on the office's عقارات screens (Figma texts). */
export type OfficeConfirm =
  | { kind: 'hideAll'; scope: 'all' | 'governorate' }
  | { kind: 'showHidden' }
  | { kind: 'deleteAll'; scope: 'all' | 'governorate' }
  | { kind: 'deleteDrafts' }
  | { kind: 'hideSelected'; count: number }
  | { kind: 'showSelected'; count: number }
  | { kind: 'deleteSelected'; count: number }
  | { kind: 'markDone'; label: string };

const TRASH_BG = '#FDECEC';

function textsFor(confirm: OfficeConfirm) {
  switch (confirm.kind) {
    case 'hideAll':
      return {
        title: 'اخفاء جميع الاعلانات مؤقتا؟',
        description:
          confirm.scope === 'governorate'
            ? 'سيتم إخفاء جميع الاعلانات من السوق ولن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.'
            : 'سيتم إخفاء جميع الاعلانات ولن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.',
        confirmLabel: 'اخفاء الاعلانات',
        danger: false,
        icon: <HideEyeIcon />,
      };
    case 'showHidden':
      return {
        title: 'اظهار الاعلانات المخفية ؟',
        description:
          'سيتم اظهار جميع الاعلانات المخفية سيتمكن العملاء من رؤيتها وطلبها.',
        confirmLabel: 'اظهار الاعلانات',
        danger: false,
        icon: <ShowEyeIcon />,
      };
    case 'deleteAll':
      return {
        title: 'هل أنت متأكد من حذف جميع الإعلانات؟',
        description:
          confirm.scope === 'governorate'
            ? 'سيتم حذف جميع اعلاناتك ولن يظهر للمستخدمين بعد الآن، وسيتم فقدان مدة التميز المتبقية.'
            : 'سيتم حذف جميع اعلاناتك من جميع المحافظات ولن يظهر للمستخدمين بعد الآن.',
        confirmLabel: 'حذف الإعلانات',
        danger: true,
        icon: <TrashLargeIcon />,
      };
    case 'deleteDrafts':
      return {
        title: 'هل أنت متأكد من حذف جميع المسودات؟',
        description: 'سيتم حذف جميع المسودات، وستفقد كل المعلومات.',
        confirmLabel: 'حذف',
        danger: true,
        icon: <TrashLargeIcon />,
      };
    case 'hideSelected':
      return {
        title: `اخفاء ${confirm.count} من الاعلانات؟`,
        description:
          'لن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.',
        confirmLabel: 'اخفاء الاعلانات',
        danger: false,
        icon: <HideEyeIcon />,
      };
    case 'showSelected':
      return {
        title: `اظهار ${confirm.count} من الاعلانات؟`,
        description: 'سيتمكن العملاء من رؤيتها وطلبها.',
        confirmLabel: 'اظهار الاعلانات',
        danger: false,
        icon: <ShowEyeIcon />,
      };
    case 'deleteSelected':
      return {
        title: `حذف ${confirm.count} من الاعلانات؟`,
        description:
          'لن تظهر للمستخدمين بعد الآن، وسيتم فقدان مدة التميز المتبقية.',
        confirmLabel: 'حذف الإعلانات',
        danger: true,
        icon: <TrashLargeIcon />,
      };
    case 'markDone':
      return {
        title: `${confirm.label}؟`,
        description:
          'سينتقل الإعلان إلى المؤرشفة ولن يظهر في السوق، ويُحسب ضمن العقارات المباعة. يمكنك إعادة نشره لاحقاً.',
        confirmLabel: confirm.label,
        danger: false,
        icon: undefined,
      };
  }
}

export interface OfficeAdSheetsHandle {
  confirm: (confirm: OfficeConfirm, onConfirm: () => void) => void;
}

/**
 * Every sheet the office's عقارات screens open: نشاطي's ad preview (with
 * «تم البيع»), draft publishing, delete, feature, and one confirmation sheet
 * whose texts follow what is being confirmed.
 */
const OfficeAdSheets = forwardRef<
  OfficeAdSheetsHandle,
  {
    adActions: ReturnType<typeof useAdActions>;
    onMarkDone: (propertyId: string) => void;
  }
>(({ adActions, onMarkDone }, ref) => {
  const confirmRef = useRef<BottomSheetModal>(null);
  const [pending, setPending] = useState<{
    confirm: OfficeConfirm;
    onConfirm: () => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    confirm: (confirm, onConfirm) => {
      setPending({ confirm, onConfirm });
      requestAnimationFrame(() => confirmRef.current?.present());
    },
  }));

  const texts = pending ? textsFor(pending.confirm) : null;
  const selected = adActions.selectedAd;

  return (
    <>
      <AdPreviewSheet
        ref={adActions.draftSheetRef}
        property={adActions.selectedDraft}
        onDeletePress={() =>
          adActions.selectedDraft &&
          adActions.handleDeleteAd(adActions.selectedDraft.id)
        }
        onPublishPress={adActions.handlePublishDraftAction}
        onEditPress={() => {}}
      />
      <AdPreviewSheet
        ref={adActions.adSheetRef}
        variant="active"
        property={selected}
        onEditPress={() => {}}
        onFeaturePress={adActions.handleFeatureAd}
        onDeletePress={() => selected && adActions.handleDeleteAd(selected.id)}
        onSharePress={adActions.handleShareSelectedAd}
        onToggleVisibility={adActions.handleToggleAdVisibility}
        markDoneLabel={selected ? markDoneLabel(selected) : undefined}
        onMarkDonePress={onMarkDone}
      />
      <DeleteConfirmationSheet
        ref={adActions.deleteSheetRef}
        onConfirm={adActions.handleConfirmDelete}
        onCancel={adActions.handleCancelDelete}
      />
      <FeatureAdSheet
        ref={adActions.featureAdSheetRef}
        propertyId={adActions.selectedPropertyId || undefined}
      />
      {texts && (
        <ConfirmActionSheet
          ref={confirmRef}
          title={texts.title}
          description={texts.description}
          confirmLabel={texts.confirmLabel}
          variant={texts.danger ? 'danger' : 'primary'}
          icon={texts.icon}
          iconBackground={texts.danger ? TRASH_BG : '#F9FAFE'}
          onConfirm={() => pending?.onConfirm()}
        />
      )}
    </>
  );
});

OfficeAdSheets.displayName = 'OfficeAdSheets';

export default OfficeAdSheets;
