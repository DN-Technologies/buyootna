import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, type RefObject, useCallback, useMemo } from 'react';

import DeleteConfirmStep from '@/features/individual/components/activity/delete-confirmation/DeleteConfirmStep';
import DeleteReasonStep from '@/features/individual/components/activity/delete-confirmation/DeleteReasonStep';
import { useDeleteReason } from '@/features/individual/components/activity/delete-confirmation/useDeleteReason';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface DeleteConfirmationSheetProps {
  onConfirm: (reason?: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  /** Skip the SOLD/OTHER reason step and delete immediately after the first confirmation (used for entities with no delete-reason concept, e.g. alerts). */
  skipReasonStep?: boolean;
}

const DeleteConfirmationSheet = forwardRef<
  BottomSheetModal,
  DeleteConfirmationSheetProps
>(
  (
    {
      onConfirm,
      onCancel,
      title = 'هل أنت متأكد من حذف الإعلان؟',
      description = 'سيتم حذف الإعلان ولن يظهر للمستخدمين بعد الآن، وسيتم فقدان مدة التميز المتبقية',
      confirmLabel = 'حذف الإعلان',
      skipReasonStep = false,
    },
    ref,
  ) => {
    const {
      step,
      setStep,
      selectedReason,
      setSelectedReason,
      customReason,
      setCustomReason,
      isSubmitActive,
      finalReason,
      reset,
    } = useDeleteReason();

    // snapPoints: 48% provides enough room for the custom text inputs in Step 2
    const snapPoints = useMemo(() => ['48%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const dismiss = () =>
      (ref as RefObject<BottomSheetModal | null> | null)?.current?.dismiss();

    const handleStep1Confirm = () => {
      if (skipReasonStep) {
        dismiss();
        onConfirm();
        return;
      }
      setStep('reason');
    };

    const handleCancel = () => {
      dismiss();
      onCancel?.();
    };

    const handleSubmitReason = () => {
      dismiss();
      onConfirm(finalReason);
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        // Reset to step 1 whenever the sheet is dismissed/closed
        onDismiss={reset}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // No android_keyboardInputMode="adjustResize": with edge-to-edge the
        // window never resizes, and in that mode the sheet doesn't move either,
        // so the keyboard covered it. The default lets the sheet rise itself.
      >
        <SafeBottomSheetView className="flex-1 items-center justify-between px-6 pb-8 pt-4">
          {step === 'confirm' ? (
            <DeleteConfirmStep
              title={title}
              description={description}
              confirmLabel={confirmLabel}
              onConfirm={handleStep1Confirm}
              onCancel={handleCancel}
            />
          ) : (
            <DeleteReasonStep
              selectedReason={selectedReason}
              onSelectReason={setSelectedReason}
              customReason={customReason}
              onChangeCustomReason={setCustomReason}
              isSubmitActive={isSubmitActive}
              onBack={() => setStep('confirm')}
              onSubmit={handleSubmitReason}
            />
          )}
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

DeleteConfirmationSheet.displayName = 'DeleteConfirmationSheet';

export default DeleteConfirmationSheet;
