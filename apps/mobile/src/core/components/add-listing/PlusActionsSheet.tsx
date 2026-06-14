import { Feather } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import {
  AddIcon,
  AlarmIcon,
  RequestPriceIcon,
} from '@/assets/icons/add-listing';
import apiClient from '@/core/api/api';

export interface PlusActionsSheetProps {
  onClose?: () => void;
  onQuotaExhausted: () => void;
}

const PlusActionsSheet = forwardRef<BottomSheet, PlusActionsSheetProps>(
  ({ onClose, onQuotaExhausted }, ref) => {
    const router = useRouter();
    const [isCheckingQuota, setIsCheckingQuota] = useState(false);

    // Height just enough to fit the 3 buttons comfortably
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

    const handleClose = () => {
      // @ts-ignore
      ref.current?.close();
      if (onClose) onClose();
    };

    const handleAddAd = async () => {
      if (isCheckingQuota) return;

      try {
        setIsCheckingQuota(true);
        // Call /users/me endpoint to fetch current profile with latest remaining free ads count
        const response = await apiClient.get('/users/me');
        const user = response.data.user;

        setIsCheckingQuota(false);

        if (user && typeof user.freeAdsRemaining === 'number') {
          if (user.freeAdsRemaining <= 0) {
            // Quota is exhausted. Close the actions sheet and present QuotaExhaustedSheet
            handleClose();
            onQuotaExhausted();
          } else {
            // User has free ads remaining. Close the actions sheet and navigate to create listing screen
            handleClose();
            router.push('/add-listing');
          }
        } else {
          Alert.alert('خطأ', 'فشل في قراءة بيانات حسابك. يرجى المحاولة لاحقاً.', [{ text: 'حسناً' }]);
        }
      } catch (error) {
        setIsCheckingQuota(false);
        console.error('Error checking quota:', error);
        Alert.alert('خطأ في الاتصال', 'فشل في التحقق من الإعلانات المتاحة. تأكد من اتصالك بالشبكة.', [{ text: 'حسناً' }]);
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView style={{ flex: 1 }} className="bg-white px-5 pt-2">
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
              onPress={() => console.log('Add Alert Pressed')}
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
              onPress={() => console.log('Request Price Pressed')}
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
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

PlusActionsSheet.displayName = 'PlusActionsSheet';

export default PlusActionsSheet;
