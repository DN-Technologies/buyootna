import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AddIcon,
  AlarmIcon,
  RequestPriceIcon,
} from '@/assets/icons/add-listing';
import { plansService } from '@/shared/api/plans.service';
import { showAlert } from '@/shared/utils/alert';

export interface PlusActionsSheetProps {
  onClose?: () => void;
  onQuotaExhausted: () => void;
}

const PlusActionsSheet = forwardRef<BottomSheetModal, PlusActionsSheetProps>(
  ({ onClose, onQuotaExhausted }, ref) => {
    const router = useRouter();
    const [isCheckingQuota, setIsCheckingQuota] = useState(false);



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

    const handleAddAd = async () => {
      if (isCheckingQuota) return;

      try {
        setIsCheckingQuota(true);
        const publishOptions = await plansService.getPublishOptions();
        setIsCheckingQuota(false);

        if (!publishOptions.canPublish) {
          handleClose();
          onQuotaExhausted();
        } else {
          handleClose();
          router.push('/add-listing');
        }
      } catch (error) {
        setIsCheckingQuota(false);
        console.error('Error checking quota:', error);
        showAlert(
          'خطأ في الاتصال',
          'فشل في التحقق من الإعلانات المتاحة. تأكد من اتصالك بالشبكة.',
          [{ text: 'حسناً' }],
        );
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
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView>
          <View className="bg-white px-5 pt-2 pb-10">
            {/* --- 1. Header --- */}
            <View className="flex-row items-center justify-between pb-6">
              <Text className="font-cairo-bold text-base text-[#111111]">
                قم باختيار الاجراء المناسب
              </Text>
              <TouchableOpacity onPress={handleClose} className="p-2">
                <Feather name="x" size={20} color="#111111" />
              </TouchableOpacity>
            </View>

            {/* --- 2. Action Buttons --- */}
            <View className="gap-4">
              {/* Action 1: Add Ad (Solid Navy) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAddAd}
                disabled={isCheckingQuota}
                className="w-full flex-row items-center gap-3 rounded-md bg-[#15304D] px-5 py-4"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                  {isCheckingQuota ? (
                    <ActivityIndicator size="small" color="#15304D" />
                  ) : (
                    <AddIcon size={15} color="#15304D" />
                  )}
                </View>
                <Text className="font-cairo-bold text-base leading-[22px] text-white">
                  اضافة اعلان
                </Text>
              </TouchableOpacity>

              {/* Action 2: Add Alert (Outlined) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  handleClose();
                  router.push('/add-alert');
                }}
                className="w-full flex-row items-center gap-3 rounded-md border border-gray-200 bg-white px-5 py-4"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]">
                  <AlarmIcon size={20} color="#111111" />
                </View>
                <Text className="font-cairo-bold text-base leading-[22px] text-[#111111]">
                  اضافة تنبيه
                </Text>
              </TouchableOpacity>

              {/* Action 3: Request Price (Outlined) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  handleClose();
                  router.push('/request-quote');
                }}
                className="w-full flex-row items-center gap-3 rounded-md border border-gray-200 bg-white px-5 py-4"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]">
                  <RequestPriceIcon size={16} color="#111111" />
                </View>
                <Text className="font-cairo-bold text-base leading-[22px] text-[#111111]">
                  طلب عرض سعر
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

PlusActionsSheet.displayName = 'PlusActionsSheet';

export default PlusActionsSheet;
