import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';

interface QuotaExhaustedSheetProps {
  onBrowsePackages?: () => void;
  onClose?: () => void;
}

const QuotaExhaustedSheet = forwardRef<
  BottomSheetModal,
  QuotaExhaustedSheetProps
>(({ onBrowsePackages, onClose }, ref) => {
  const userRole = useAuthStore((state) => state.user?.role);

  // Height snap points (45% fits the double buttons and text perfectly)
  const snapPoints = useMemo(() => ['45%'], []);

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
    // @ts-ignore
    ref.current?.dismiss();
    if (onClose) onClose();
  };

  const handleBrowse = () => {
    handleClose();
    if (onBrowsePackages) onBrowsePackages();
  };

  const description =
    userRole === 'COMPANY' || userRole === 'OFFICE'
      ? 'تم إرسال طلبك إلى الشركات المناسبة، وستتلقى عروض الأسعار قريباً.'
      : 'لتتمكن من نشر عقار جديد والوصول إلى آلاف المشترين يومياً، يرجى ترقية حسابك وشراء باقات إعلانية مميزة.';

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <BottomSheetView className="mb-6 flex-1 items-center justify-between px-6 pb-8 pt-4">
        {/* --- Top content --- */}
        <View className="mt-4 items-center">
          {/* Verified Success Badge */}
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Image
              source={require('@/assets/icons/success-icon.svg')}
              style={{ width: 74, height: 74 }}
            />
          </View>

          {/* Title */}
          <Text className="text-center font-cairo-bold text-xl text-[#111111] mb-2">
            لقد استهلكت جميع إعلاناتك المجانية
          </Text>

          {/* Description */}
          <Text className="mb-6 px-4 text-center font-cairo-semibold text-sm leading-6 text-[#6B6A6A]">
            {description}
          </Text>
        </View>

        {/* --- Action Buttons --- */}
        <View className="w-full gap-3">
          {/* Solid Browse Packages Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBrowse}
            className="w-full h-12 items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              استعرض الباقات
            </Text>
          </TouchableOpacity>

          {/* Outlined Back Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="w-full h-12 items-center justify-center rounded-full border border-gray-200 bg-white"
          >
            <Text className="font-cairo-bold text-[15px] text-[#111111]">
              العودة
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

QuotaExhaustedSheet.displayName = 'QuotaExhaustedSheet';

export default QuotaExhaustedSheet;
