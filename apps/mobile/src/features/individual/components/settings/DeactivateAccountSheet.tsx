import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';

import DeactivateIntroStep from '@/features/individual/components/settings/deactivate-account/DeactivateIntroStep';
import DeactivateOtpStep from '@/features/individual/components/settings/deactivate-account/DeactivateOtpStep';
import DeactivateReasonsStep from '@/features/individual/components/settings/deactivate-account/DeactivateReasonsStep';
import { maskPhoneNumber } from '@/features/individual/components/settings/deactivate-account/format';
import { useDeactivateAccountFlow } from '@/features/individual/components/settings/deactivate-account/useDeactivateAccountFlow';
import { useAuthStore } from '@/shared/store/useAuthStore';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export interface DeactivateAccountSheetProps {
  userPhone?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Multi-step bottom sheet for temporarily deactivating the account:
 * intro (Figma 1684-60307) → reasons (1684-60321/60354/60387) → code check
 * and confirmation (1684-60280). Steps live in ./deactivate-account.
 */
const DeactivateAccountSheet = forwardRef<
  BottomSheetModal,
  DeactivateAccountSheetProps
>(({ userPhone, onSuccess, onCancel }, ref) => {
  const authUser = useAuthStore((state) => state.user);
  const phone = userPhone || authUser?.phone || '';

  const dismiss = useCallback(() => {
    if (ref && 'current' in ref) ref.current?.dismiss();
  }, [ref]);

  const flow = useDeactivateAccountFlow({ dismiss, onSuccess, onCancel });

  // The reasons step needs room for all four reasons plus both buttons,
  // and more when the "أخرى" text box is open
  const snapPoints = useMemo(() => {
    if (flow.step === 'intro') return ['48%'];
    if (flow.step === 'reasons') return flow.hasOtherReason ? ['60%'] : ['50%'];
    return ['50%'];
  }, [flow.step, flow.hasOtherReason]);

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

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      // Size from snapPoints: with dynamic sizing (the v5 default) it opened
      // at the measured content height, cutting off reasons and buttons
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      onDismiss={flow.reset}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      // No android_keyboardInputMode="adjustResize": with edge-to-edge the
      // window never resizes, and in that mode the sheet doesn't move either,
      // so the keyboard covered it. The default lets the sheet rise itself.
    >
      <SafeBottomSheetView className="flex-1 px-4 pb-8 pt-2">
        {flow.step === 'intro' && (
          <DeactivateIntroStep
            onContinue={flow.goToReasons}
            onCancel={flow.cancel}
          />
        )}

        {flow.step === 'reasons' && (
          <DeactivateReasonsStep
            selectedReasons={flow.selectedReasons}
            otherReasonText={flow.otherReasonText}
            onToggleReason={flow.toggleReason}
            onChangeOtherReason={flow.setOtherReasonText}
            duration={flow.duration}
            onChangeDuration={flow.setDuration}
            onBack={flow.goToIntro}
            onSubmit={flow.goToOtp}
            onCancel={flow.cancel}
          />
        )}

        {flow.step === 'otp' && (
          <DeactivateOtpStep
            // The server's masked destination once the code is sent; the
            // locally known phone meanwhile
            destination={flow.destination ?? maskPhoneNumber(phone)}
            otp={flow.otp}
            onChangeOtp={flow.setOtp}
            otpInputRef={flow.otpInputRef}
            countdown={flow.countdown}
            onResend={flow.resendOtp}
            errorMessage={flow.errorMessage}
            isLoading={flow.isLoading}
            onConfirm={flow.confirm}
            onClose={flow.cancel}
          />
        )}
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

DeactivateAccountSheet.displayName = 'DeactivateAccountSheet';
export default DeactivateAccountSheet;
