import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Tabs } from 'expo-router';
import { useRef } from 'react';

import CompanyActionsSheet from '@/features/company/components/CompanyActionsSheet';
import CustomTabBar from '@/features/individual/components/CustomTabBar';
import AuthGuardSheet from '@/shared/components/AuthGuardSheet';
import ComingSoonGate from '@/shared/components/ComingSoonGate';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Company tabs stay behind the ComingSoonGate unless explicitly enabled via
// env (EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS=true) — e.g. on the feat/companies
// branch. Unset elsewhere (dev/main/production) keeps production locked.
const COMPANIES_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS === 'true';

export default function CompanyLayout() {
  const token = useAuthStore((state) => state.token);

  const actionsSheetRef = useRef<BottomSheetModal>(null);
  const authGuardSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenPlusSheet = () => {
    if (!token) {
      authGuardSheetRef.current?.present();
    } else {
      actionsSheetRef.current?.present();
    }
  };

  if (!COMPANIES_ENABLED) {
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
      >
        <Tabs.Screen name="company-home" />
        <Tabs.Screen name="company-requests" />

        {/* The Center Add Button */}
        <Tabs.Screen name="add" />

        <Tabs.Screen name="company-chats" />
        <Tabs.Screen name="company-more" />
      </Tabs>
      {/* Bottom sheets mounted outside Tabs so the backdrop covers the entire screen */}
      <CompanyActionsSheet ref={actionsSheetRef} />
      <AuthGuardSheet ref={authGuardSheetRef} />
    </>
  );
}
