import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';

import FeatureAdBenefitsBanner from '@/features/individual/components/activity/ads/feature-ad/FeatureAdBenefitsBanner';
import FeatureAdCheckoutButton from '@/features/individual/components/activity/ads/feature-ad/FeatureAdCheckoutButton';
import FeatureAdHeader from '@/features/individual/components/activity/ads/feature-ad/FeatureAdHeader';
import FeaturePackageList from '@/features/individual/components/activity/ads/feature-ad/FeaturePackageList';
import { useFeatureAd } from '@/features/individual/hooks/useFeatureAd';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface FeatureAdSheetProps {
  propertyId?: string;
}

// Pick a package, then pay on «الدفع» (Tap) to feature one of the user's ads
const FeatureAdSheet = forwardRef<BottomSheetModal, FeatureAdSheetProps>(
  ({ propertyId }, ref) => {
    const snapPoints = useMemo(() => ['78%'], []);
    const feature = useFeatureAd(propertyId);

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
    };

    // «الدفع» (Figma 5557:142956) takes it from here: «كود الخصم», the
    // method, Tap, and the outcome popup, which refreshes the ad
    const handlePayment = () => {
      if (!propertyId || !feature.selectedPackage) return;
      handleClose();
      router.push({
        pathname: '/checkout',
        params: {
          purpose: 'feature',
          propertyId,
          featurePackageId: feature.selectedPackage.id,
        },
      });
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={!feature.isProcessing}
        onDismiss={feature.reset}
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
        <SafeBottomSheetView className="flex-1 justify-between bg-white px-4 pb-6 pt-2">
          <View>
            <FeatureAdHeader onClose={handleClose} />
            <FeatureAdBenefitsBanner />
            <FeaturePackageList
              packages={feature.packages}
              selectedPackageId={feature.selectedPackageId}
              isLoading={feature.isLoading}
              isError={feature.isError}
              disabled={feature.isProcessing}
              onSelect={feature.selectPackage}
              onRetry={feature.refetch}
            />
          </View>

          <FeatureAdCheckoutButton
            price={feature.selectedPackage?.price}
            isProcessing={feature.isProcessing}
            onPress={handlePayment}
          />
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

FeatureAdSheet.displayName = 'FeatureAdSheet';

export default FeatureAdSheet;
