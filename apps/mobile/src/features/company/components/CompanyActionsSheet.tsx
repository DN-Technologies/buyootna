import { Feather, Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export interface CompanyActionsSheetProps {
  onClose?: () => void;
}

const CompanyActionsSheet = forwardRef<
  BottomSheetModal,
  CompanyActionsSheetProps
>(({ onClose }, ref) => {
  const router = useRouter();

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

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: '#111111',
        width: 40,
        height: 4,
      }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <SafeBottomSheetView>
        <View className="bg-white px-4 pb-10 pt-2">
          {/* --- 1. Header --- */}
          <View className="flex-row items-center justify-between pb-4">
            <Text
              className="font-cairo-semibold text-[18px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              إضافة جديد
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* --- 2. Action Buttons --- */}
          <View className="gap-3">
            {/* Action 1: Add Service (Solid Navy) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                handleClose();
                router.push('/add-service');
              }}
              className="w-full flex-row items-center gap-2 rounded-lg border border-[#15304D] bg-[#15304D] px-4 py-3"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                <Ionicons name="headset-outline" size={20} color="#111111" />
              </View>
              <Text
                className="font-cairo-medium text-[16px] leading-[21px] text-white"
                style={{ writingDirection: 'rtl' }}
              >
                اضافة خدمة
              </Text>
            </TouchableOpacity>

            {/* Action 2: Issue Invoice (Outlined) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                handleClose();
                router.push('/create-invoice');
              }}
              className="w-full flex-row items-center gap-2 rounded-lg border border-[#D7D7D7] bg-white px-4 py-3"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                <Ionicons name="receipt-outline" size={20} color="#111111" />
              </View>
              <Text
                className="font-cairo-medium text-[16px] leading-[21px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                اصدار فاتورة
              </Text>
            </TouchableOpacity>

            {/* Action 3: Add Portfolio Project (Outlined) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                handleClose();
                router.push('/add-project');
              }}
              className="w-full flex-row items-center gap-2 rounded-lg border border-[#D7D7D7] bg-white px-4 py-3"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                <Ionicons name="images-outline" size={20} color="#111111" />
              </View>
              <Text
                className="font-cairo-medium text-[16px] leading-[21px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                اضافة مشروع لمعرض الأعمال
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

CompanyActionsSheet.displayName = 'CompanyActionsSheet';

export default CompanyActionsSheet;
