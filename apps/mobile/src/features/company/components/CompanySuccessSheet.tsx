import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface CompanySuccessSheetProps {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

/**
 * The green-rosette sheet that closes each company "+" flow (Figma
 * 4410:167882 service, 4410:167898 project, 4410:167960 invoice): it sizes
 * itself to its content, with a navy button over a neutral outlined one.
 */
const CompanySuccessSheet = forwardRef<
  BottomSheetModal,
  CompanySuccessSheetProps
>(
  (
    { title, description, primaryLabel, onPrimary, secondaryLabel, onSecondary },
    ref,
  ) => {
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
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#000000',
          width: 45,
          height: 5,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <SafeBottomSheetView accessible={false}>
          <View className="items-center gap-5 px-4 pb-6 pt-3">
            <View className="w-full items-center gap-4">
              <Image
                source={require('@/assets/icons/success-icon.svg')}
                style={{ width: 73.44, height: 75 }}
              />
              <View className="w-full items-center gap-2">
                <Text className="text-center font-cairo-semibold text-[20px] leading-[30px] text-[#111111]">
                  {title}
                </Text>
                <Text
                  className="text-center font-cairo-medium text-[14px] leading-[21px] text-[#6B6A6A]"
                  style={{ letterSpacing: -0.408 }}
                >
                  {description}
                </Text>
              </View>
            </View>

            <View className="w-full gap-2">
              <TouchableOpacity
                testID="company-success-primary"
                activeOpacity={0.85}
                onPress={onPrimary}
                className="h-12 w-full items-center justify-center rounded-[24px] border border-[#15304D] bg-[#15304D]"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-white"
                  style={{ letterSpacing: 0.28 }}
                >
                  {primaryLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="company-success-secondary"
                activeOpacity={0.85}
                onPress={onSecondary}
                className="h-12 w-full items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
                  style={{ letterSpacing: 0.28 }}
                >
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

CompanySuccessSheet.displayName = 'CompanySuccessSheet';

export default CompanySuccessSheet;
