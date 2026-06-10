import BottomSheet from '@gorhom/bottom-sheet';
import { Tabs } from 'expo-router';
import { useRef } from 'react';

import PlusActionsSheet from '@/core/components/add/PlusActionsSheet';
import CustomTabBar from '@/core/components/CustomTabBar';

export default function MainLayout() {
  // 1. Reference to control the bottom sheet from this top-level layout
  const plusSheetRef = useRef<BottomSheet>(null);

  // 2. Function to trigger the sheet, which we pass down to the CustomTabBar
  const handleOpenPlusSheet = () => {
    plusSheetRef.current?.expand();
  };
  return (
    <>
      <Tabs
        // 3. Pass the trigger function into your beautiful custom SVG tab bar
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

        <Tabs.Screen name="chats" />
        <Tabs.Screen name="profile" />
      </Tabs>
      {/* 4. Mounted outside the Tabs so the dark backdrop covers the entire screen, including the tab bar */}
      <PlusActionsSheet ref={plusSheetRef} />
    </>
  );
}
