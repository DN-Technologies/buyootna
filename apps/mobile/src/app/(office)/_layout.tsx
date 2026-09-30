import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, Tabs } from 'expo-router';
import { useRef } from 'react';

import PlusActionsSheet from '@/shared/components/add-listing/PlusActionsSheet';
import QuotaExhaustedSheet from '@/shared/components/add-listing/QuotaExhaustedSheet';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import ComingSoonGate from '@/shared/components/auth/ComingSoonGate';
import CustomTabBar from '@/shared/components/navigation/CustomTabBar';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Office accounts are enabled when EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS is 'true'
// or by default on the feat/offices branch unless explicitly disabled ('false').
const OFFICES_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_OFFICE_ACCOUNTS !== 'false';

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

  if (!OFFICES_ENABLED) {
    return <ComingSoonGate />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onOpenPlusSheet={handleOpenPlusSheet} />
        )}
        screenOptions={{
          headerShown: false,
        }}
        backBehavior="history"
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
      <QuotaExhaustedSheet
        ref={quotaSheetRef}
        onBrowsePackages={() => router.push('/plans')}
      />
      <AuthGuardSheet ref={authGuardSheetRef} />
    </>
  );
}
