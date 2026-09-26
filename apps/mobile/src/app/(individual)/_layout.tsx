import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, Tabs } from 'expo-router';
import { useRef } from 'react';

import PlusActionsSheet from '@/shared/components/add-listing/PlusActionsSheet';
import QuotaExhaustedSheet from '@/shared/components/add-listing/QuotaExhaustedSheet';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import CustomTabBar from '@/shared/components/navigation/CustomTabBar';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function MainLayout() {
  const token = useAuthStore((state) => state.token);

  // References to control bottom sheets from this top-level layout
  const plusSheetRef = useRef<BottomSheetModal>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);
  const authGuardSheetRef = useRef<BottomSheetModal>(null);

  // Function to trigger the sheet, which we pass down to the CustomTabBar
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
        // Pass the trigger function into your beautiful custom SVG tab bar
        tabBar={(props) => (
          <CustomTabBar {...props} onOpenPlusSheet={handleOpenPlusSheet} />
        )}
        screenOptions={{
          headerShown: false,
        }}
        // The default 'firstRoute' rebuilds this navigator's back-history to
        // just [home, currentRoute] on every navigation, so "Back" from any
        // (more)/* sub-screen (which lives inside this Tabs group) always
        // landed on Home instead of the More tab it was actually pushed
        // from. 'history' preserves the real navigation path instead.
        backBehavior="history"
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="companies" />

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
      <QuotaExhaustedSheet
        ref={quotaSheetRef}
        onBrowsePackages={() => router.push('/plans')}
      />
      <AuthGuardSheet ref={authGuardSheetRef} />
    </>
  );
}
