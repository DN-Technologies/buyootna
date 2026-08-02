import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Tabs } from 'expo-router';
import { useRef } from 'react';

import CustomTabBar from '@/features/individual/components/CustomTabBar';
import PlusActionsSheet from '@/shared/components/add-listing/PlusActionsSheet';
import QuotaExhaustedSheet from '@/shared/components/add-listing/QuotaExhaustedSheet';
import AuthGuardSheet from '@/shared/components/AuthGuardSheet';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function OfficeLayout() {
  const token = useAuthStore((state) => state.token);

  const plusSheetRef = useRef<BottomSheetModal>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);
  const authGuardSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenPlusSheet = () => {
    if (!token) {
      authGuardSheetRef.current?.present();
    } else {
      plusSheetRef.current?.present();
    }
  };

  const handleOpenQuotaSheet = () => {
    quotaSheetRef.current?.present();
  };

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onOpenPlusSheet={handleOpenPlusSheet} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="office-home" />
        <Tabs.Screen name="office-properties" />

        {/* The Center Add Button */}
        <Tabs.Screen name="add" />

        <Tabs.Screen name="office-chats" />
        <Tabs.Screen name="office-more" />
      </Tabs>
      {/* Bottom sheets mounted outside Tabs so the backdrop covers the entire screen */}
      <PlusActionsSheet
        ref={plusSheetRef}
        onQuotaExhausted={handleOpenQuotaSheet}
      />
      <QuotaExhaustedSheet ref={quotaSheetRef} />
      <AuthGuardSheet ref={authGuardSheetRef} />
    </>
  );
}
