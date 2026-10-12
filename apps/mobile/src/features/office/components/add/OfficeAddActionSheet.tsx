import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

export interface OfficeAddActionSheetProps {
  onClose?: () => void;
  onAddListing?: () => void;
  onAddService?: () => void;
}

export const OfficeAddActionSheet = forwardRef<
  BottomSheetModal,
  OfficeAddActionSheetProps
>(({ onClose, onAddListing, onAddService }, ref) => {
  const router = useRouter();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  const handleClose = () => {
    // @ts-ignore
    ref.current?.dismiss();
    onClose?.();
  };

  const handleAddListing = () => {
    handleClose();
    if (onAddListing) {
      onAddListing();
    } else {
      router.push('/(office)/add');
    }
  };

  const handleAddService = () => {
    handleClose();
    if (onAddService) {
      onAddService();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: '#000000',
        width: 45,
        height: 5,
        borderRadius: 100,
      }}
      backgroundStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <SafeBottomSheetView>
        <View className="bg-white px-4 pb-10 pt-2" testID="office-add-action-sheet">
          {/* Header */}
          <View className="flex-row items-center justify-between py-1.5 pl-2.5 pr-4">
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
              accessibilityLabel="إغلاق"
              testID="close-sheet-button"
            >
              <Feather name="x" size={18} color="#111111" />
            </TouchableOpacity>

            <View className="flex-1 items-end">
              <Text className="font-cairo-semibold text-lg text-[#111111]">
                إضافة جديد
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-4 flex-col gap-3">
            {/* Action 1: Add Listing (Navy background) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddListing}
              className="w-full flex-row items-center justify-end rounded-lg border border-[#15304D] bg-[#15304D] px-4 py-3"
              testID="add-listing-action"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="font-cairo-medium text-base text-white">
                  اضافة اعلان
                </Text>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                  <Ionicons name="home-outline" size={18} color="#15304D" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Action 2: Add Service (Outlined white background) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddService}
              className="w-full flex-row items-center justify-end rounded-lg border border-[#D7D7D7] bg-white px-4 py-3"
              testID="add-service-action"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="font-cairo-medium text-base text-[#111111]">
                  اضافة خدمة
                </Text>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={18}
                    color="#15304D"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

OfficeAddActionSheet.displayName = 'OfficeAddActionSheet';

export default OfficeAddActionSheet;
