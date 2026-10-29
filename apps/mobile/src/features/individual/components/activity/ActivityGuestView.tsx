import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';

export interface ActivityGuestViewProps {
  onMenuPress: () => void;
}

// Shown instead of the activity list when the user isn't signed in
export default function ActivityGuestView({
  onMenuPress,
}: ActivityGuestViewProps) {
  const authSheetRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ActivityHeader
        // A guest can't add anything: the "+" asks them to sign in instead
        // of opening add-listing, which loaded forever without a session
        onAddPress={() => authSheetRef.current?.present()}
        onMenuPress={onMenuPress}
      />
      <GuestEmptyState
        icon="send"
        title="ابدأ رحلتك العقارية"
        description="سجل حسابك لإدارة الإعلانات والتنبيهات وعروض الأسعار الخاصة بك"
      />
      <AuthGuardSheet ref={authSheetRef} />
    </SafeAreaView>
  );
}
