import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Tabs, useRouter } from 'expo-router';
import { useRef } from 'react';

import PlusActionsSheet from '@/core/components/add-listing/PlusActionsSheet';
import QuotaExhaustedSheet from '@/core/components/add-listing/QuotaExhaustedSheet';
import CustomTabBar from '@/core/components/CustomTabBar';
import { useAuthStore } from '@/store/useAuthStore';

export default function MainLayout() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // References to control bottom sheets from this top-level layout
  const plusSheetRef = useRef<BottomSheet>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);

  // Function to trigger the sheet, which we pass down to the CustomTabBar
  const handleOpenPlusSheet = () => {
    if (!token) {
      router.push('/(auth)/selection');
    } else {
      plusSheetRef.current?.expand();
    }
  };

  const handleOpenQuotaSheet = () => {
    quotaSheetRef.current?.present();
  };

  return (
    <>
      <Tabs
        // Pass the trigger function into your beautiful custom SVG tab bar
        tabBar={(props) => (
          <CustomTabBar {...props} onOpenPlusSheet={handleOpenPlusSheet} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="explore" />

        {/* The Center Add Button */}
        <Tabs.Screen
          name="add"
          options={
            {
              // Optional: If we want clicking 'Add' to open a bottom sheet instead of a real screen,
              // we would handle that inside the CustomTabBar onPress logic.
              // For now, it routes to a screen called add.tsx
            }
          }
        />

        <Tabs.Screen name="activity" />
        <Tabs.Screen name="more" />
      </Tabs>
      {/* Mounted outside the Tabs so the dark backdrop covers the entire screen, including the tab bar */}
      <PlusActionsSheet
        ref={plusSheetRef}
        onQuotaExhausted={handleOpenQuotaSheet}
      />
      <QuotaExhaustedSheet ref={quotaSheetRef} />
    </>
  );
}
