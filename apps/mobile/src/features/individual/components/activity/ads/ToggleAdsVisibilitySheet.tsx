import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { HideEyeIcon, ShowEyeIcon } from '@/assets/icons/activity';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export type AdsVisibilityMode = 'hide' | 'show';

export interface ToggleAdsVisibilitySheetProps {
  mode: AdsVisibilityMode;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ToggleAdsVisibilitySheet = forwardRef<
  BottomSheetModal,
  ToggleAdsVisibilitySheetProps
>(({ mode, onConfirm, onCancel, isLoading = false }, ref) => {
  const snapPoints = useMemo(() => ['44%'], []);

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

  const handleConfirmPress = () => {
    handleClose();
    onConfirm();
  };

  const isHide = mode === 'hide';

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
          {/* Circular Icon Container */}
          <View className="mb-4 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#F9FAFE]">
            {isHide ? (
              <HideEyeIcon size={32} color="#15304D" />
            ) : (
              <ShowEyeIcon size={32} color="#15304D" />
            )}
          </View>

          {/* Title & Description */}
          <Text
            className="mb-2 text-center font-cairo-semibold text-[18px] leading-[24px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {isHide ? 'اخفاء جميع الاعلانات مؤقتا؟' : 'اظهار الاعلانات المخفية ؟'}
          </Text>
          <Text
            className="px-2 text-center font-cairo-medium text-[14px] leading-[22px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {isHide
              ? 'سيتم إخفاء جميع الاعلانات من السوق ولن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.'
              : 'سيتم اظهار جميع الاعلانات المخفية سيتمكن العملاء من رؤيتها وطلبها.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 pt-4">
          <TouchableOpacity
            testID={isHide ? 'confirm-hide-ads-btn' : 'confirm-show-ads-btn'}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={handleConfirmPress}
            className="h-[48px] w-full items-center justify-center rounded-[24px] bg-[#15304D]"
          >
            <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
              {isHide ? 'اخفاء الاعلانات' : 'اظهار الاعلانات'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="cancel-toggle-visibility-btn"
            activeOpacity={0.8}
            onPress={handleClose}
            className="h-[48px] w-full items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
          >
            <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]">
              تراجع
            </Text>
          </TouchableOpacity>
        </View>
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

ToggleAdsVisibilitySheet.displayName = 'ToggleAdsVisibilitySheet';

export default ToggleAdsVisibilitySheet;
