import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityHeader from '@/features/individual/components/activity/ActivityHeader';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';

export interface ActivityGuestViewProps {
  onMenuPress: () => void;
}

// Shown instead of the activity list when the user isn't signed in
export default function ActivityGuestView({
  onMenuPress,
}: ActivityGuestViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ActivityHeader
        onAddPress={() => router.push('/add-listing')}
        onMenuPress={onMenuPress}
      />
      <GuestEmptyState
        icon="send"
        title="ابدأ رحلتك العقارية"
        description="سجل حسابك لإدارة الإعلانات والتنبيهات وعروض الأسعار الخاصة بك"
      />
    </SafeAreaView>
  );
}
