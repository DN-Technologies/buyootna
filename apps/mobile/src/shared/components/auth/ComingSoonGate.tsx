import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/shared/store/useAuthStore';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

// Blocks access to the company/office signup, login, and in-app screens
// while those account types are temporarily unavailable. Renders a
// non-dismissible modal instead of the real screen underneath.
export default function ComingSoonGate() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['42%'], []);
  const identities = useAuthStore((state) => state.identities);
  const activeIdentity = useAuthStore((state) => state.activeIdentity);
  const switchIdentity = useAuthStore((state) => state.switchIdentity);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="none"
      />
    ),
    [],
  );

  const handleGoBack = async () => {
    const individualIdentity = identities.find(
      (identity) => identity.type === 'INDIVIDUAL',
    );

    if (!individualIdentity) {
      await logout();
      router.replace('/(auth)/individual-auth');
      return;
    }

    if (individualIdentity.id !== activeIdentity?.id) {
      await switchIdentity(individualIdentity.id);
    }
    router.replace('/(individual)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <SafeBottomSheetView className="flex-1 items-center px-6 pb-8 pt-8">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-[#F0F5FA]">
            <Feather name="clock" size={26} color="#15304D" />
          </View>

          <Text className="mb-2 text-center font-cairo-bold text-lg text-[#111111]">
            قريباً
          </Text>

          <Text className="mb-6 text-center font-cairo-semibold text-[13px] leading-[20px] text-[#6B6A6A]">
            حسابات المكاتب العقارية والشركات غير متاحة حالياً، نعمل على تجهيزها
            لتقديم أفضل تجربة لك.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoBack}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              العودة للرئيسية
            </Text>
          </TouchableOpacity>
        </SafeBottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
