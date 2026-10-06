import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  getRepublishCredits,
  getRepublishCreditsFromOptions,
  planTypeToSpend,
  type RepublishMode,
  type RepublishPlanType,
} from '@/features/individual/components/activity/republish-ad/republishCredits';
import RepublishPlanPicker from '@/features/individual/components/activity/republish-ad/RepublishPlanPicker';
import RepublishSheetActions from '@/features/individual/components/activity/republish-ad/RepublishSheetActions';
import RepublishSheetText from '@/features/individual/components/activity/republish-ad/RepublishSheetText';
import type { PublishOption } from '@/shared/api/plans.service';
import { SubscriptionInfo } from '@/shared/hooks/useMyActivity';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export type {
  RepublishMode,
  RepublishPlanType,
} from '@/features/individual/components/activity/republish-ad/republishCredits';

export interface RepublishAdSheetProps {
  mode?: RepublishMode;
  freeAdsRemaining?: number;
  subscription?: SubscriptionInfo;
  // The user's real wallet (GET /plans/wallet/publish-options); preferred
  // over freeAdsRemaining/subscription when given
  publishOptions?: PublishOption[];
  // planSlotId is the wallet slot to spend (only known with publishOptions)
  onConfirm: (
    planType?: RepublishPlanType,
    planSlotId?: string,
  ) => void | Promise<void>;
  onNavigateToPlans?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Confirms republishing an archived ad, spending one credit (or, with no
// credit, sends the user to the plans)
const RepublishAdSheet = forwardRef<BottomSheetModal, RepublishAdSheetProps>(
  (
    {
      mode,
      freeAdsRemaining = 0,
      subscription,
      publishOptions,
      onConfirm,
      onNavigateToPlans,
      onCancel,
      isLoading = false,
    },
    ref,
  ) => {
    const credits = useMemo(
      () =>
        publishOptions
          ? getRepublishCreditsFromOptions(publishOptions, mode)
          : getRepublishCredits(freeAdsRemaining, subscription, mode),
      [publishOptions, freeAdsRemaining, subscription, mode],
    );

    const [selectedPlanType, setSelectedPlanType] =
      useState<RepublishPlanType>('FEATURED');

    const snapPoints = useMemo(
      () => (credits.mode === 'multi' ? ['46%'] : ['38%']),
      [credits.mode],
    );

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

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
      onCancel?.();
    };

    const handlePrimaryPress = async () => {
      if (credits.mode === 'zero-credit') {
        handleClose();
        if (onNavigateToPlans) {
          onNavigateToPlans();
        } else {
          router.push('/plans' as any);
        }
        return;
      }

      const planType = planTypeToSpend(credits, selectedPlanType);
      const planSlotId =
        planType === 'FEATURED' ? credits.featuredSlotId : credits.regularSlotId;
      handleClose();
      // Without the wallet there's no slot to name; keep the one-arg call
      await (planSlotId ? onConfirm(planType, planSlotId) : onConfirm(planType));
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{
          width: 45,
          height: 5,
          backgroundColor: '#000000',
          borderRadius: 100,
        }}
        backgroundStyle={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <SafeBottomSheetView className="flex-1 justify-between bg-white px-4 pb-8 pt-2">
          <View className="items-center">
            <RepublishSheetText
              mode={credits.mode}
              days={
                planTypeToSpend(credits, selectedPlanType) === 'FEATURED'
                  ? credits.featuredDays
                  : credits.regularDays
              }
            />
            {credits.mode === 'multi' && (
              <RepublishPlanPicker
                featuredCount={credits.featuredCount}
                regularCount={credits.regularCount}
                selected={selectedPlanType}
                onSelect={setSelectedPlanType}
              />
            )}
          </View>

          <RepublishSheetActions
            hasCredit={credits.mode !== 'zero-credit'}
            isLoading={isLoading}
            onPrimaryPress={handlePrimaryPress}
            onCancel={handleClose}
          />
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

RepublishAdSheet.displayName = 'RepublishAdSheet';

export default RepublishAdSheet;
