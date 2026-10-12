import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

interface DiscardChangesSheetProps {
  onCancel: () => void; // Continue editing
  onConfirm: () => void; // Exit without saving
}

const AlertTriangleIcon = ({ color = '#D97706', size = 28 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53225 19 5.07183 19Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DiscardChangesSheet = forwardRef<BottomSheetModal, DiscardChangesSheetProps>(
  ({ onCancel, onConfirm }, ref) => {
    // Snap points: ~35% of screen height is perfect for warning dialogs
    const snapPoints = useMemo(() => ['40%'], []);

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
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <SafeBottomSheetView className="flex-1 items-center justify-between px-6 pb-8 pt-4">
          <View className="items-center w-full">
            {/* Soft yellow circle with alert triangle */}
            <View className="h-[75px] w-[75px] items-center justify-center rounded-full bg-[#FFF9DA] mb-4">
              <AlertTriangleIcon size={28} color="#B97500" />
            </View>

            {/* Title */}
            <Text className="font-cairo-bold text-lg text-[#111111] mb-2 text-center">
              تجاهل التعديلات؟
            </Text>

            {/* Description */}
            <Text
              className="font-cairo text-sm text-[#6B6A6A] leading-6 text-center px-4"
              style={{ writingDirection: 'rtl' }}
            >
              لقد قمت بإجراء بعض التغييرات على الإعلان. إذا غادرت الآن، ستفقد كل التعديلات غير المحفوظة.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full mt-2 gap-3">
            {/* Primary Action: Continue editing */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              className="h-[48px] w-full items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-semibold leading-[24px] text-[14px] text-white">
                متابعة التعديل
              </Text>
            </TouchableOpacity>

            {/* Secondary Action: Discard and exit */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              className="h-[48px] w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#111111]">
                خروج بدون حفظ
              </Text>
            </TouchableOpacity>
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

DiscardChangesSheet.displayName = 'DiscardChangesSheet';

export default DiscardChangesSheet;
