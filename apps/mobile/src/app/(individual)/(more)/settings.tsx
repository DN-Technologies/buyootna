import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeactivateAccountSheet } from '@/features/individual/components/settings';
import AccountActions from '@/features/individual/components/settings/AccountActions';
import PrivacySettingsSection from '@/features/individual/components/settings/PrivacySettingsSection';
import SettingsHeader from '@/features/individual/components/settings/SettingsHeader';
import SettingsSkeleton from '@/features/individual/components/settings/SettingsSkeleton';
import SupportSection from '@/features/individual/components/settings/SupportSection';
import { useDeleteAccount } from '@/features/individual/hooks/useDeleteAccount';
import { useUserSettings } from '@/features/individual/hooks/useUserSettings';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const deactivateSheetRef = useRef<BottomSheetModal>(null);

  const settings = useUserSettings();
  const handleDeleteAccount = useDeleteAccount();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SettingsHeader onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 16 }}
      >
        {settings.isLoading ? (
          <SettingsSkeleton />
        ) : (
          <View className="gap-6 px-5">
            <PrivacySettingsSection
              showWhatsapp={settings.showWhatsapp}
              hideActivity={settings.hideActivity}
              hideOfficeAds={settings.hideOfficeAds}
              onChange={settings.updateSettings}
            />
            <SupportSection
              onPrivacy={() => router.push('/privacy')}
              onTerms={() => router.push('/terms')}
            />
            <AccountActions
              onDelete={handleDeleteAccount}
              onDeactivate={() => deactivateSheetRef.current?.present()}
            />
          </View>
        )}
      </ScrollView>

      {/* Multi-step deactivation (Figma 1684-60307, 60321, 60354, 60387, 60280) */}
      <DeactivateAccountSheet ref={deactivateSheetRef} userPhone={user?.phone} />
    </SafeAreaView>
  );
}
