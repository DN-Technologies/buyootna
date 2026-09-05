import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LogoutBottomSheet from '@/features/auth/components/LogoutBottomSheet';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import AccountProfileHeaderCard from '@/features/individual/components/more/AccountProfileHeaderCard';
import GuestMenuSections from '@/features/individual/components/more/GuestMenuSections';
import GuestProfileGreetingCard from '@/features/individual/components/more/GuestProfileGreetingCard';
import IndividualMenuSections from '@/features/individual/components/more/IndividualMenuSections';
import MoreScreenFooter from '@/features/individual/components/more/MoreScreenFooter';
import { useTabBarHeight } from '@/features/individual/hooks/useTabBarHeight';
import AuthGuardSheet from '@/shared/components/AuthGuardSheet';
import ContentContainer from '@/shared/components/ContentContainer';
import ProfileHeaderCardSkeleton from '@/shared/components/skeletons/ProfileHeaderCardSkeleton';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function ProfileDashboardScreen() {
  const router = useRouter();
  const { user, token, logout, refreshProfile } = useAuthStore();
  const { guardAction, authSheetRef } = useAuthGuard();
  const { activeIdentity, displayName, avatarUrl, getTypeLabel } = useIdentity();
  const { scrollContentBottomPadding } = useTabBarHeight();

  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const unreadChatCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0
  );
  const unreadNotificationsCount = useUnreadNotificationsCount();

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const logoutSheetRef = useRef<BottomSheetModal>(null);

  // Sync user profile state from NestJS backend when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
      }
    }, [refreshProfile, token, loadConversations])
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scrollContentBottomPadding }}
        >
          <ContentContainer>
            <GuestProfileGreetingCard
              onCreateAccount={() => router.push('/(auth)/selection')}
            />

            <GuestMenuSections guardAction={guardAction} />

            {/* Login Button */}
            <View className="mt-8 px-5">
              <TouchableOpacity
                onPress={() => router.push('/(auth)/individual-auth')}
                className="flex-row items-center justify-center gap-2 rounded-full border border-[#15304D] bg-white py-4"
              >
                <Text className="font-cairo-bold text-[15px] leading-[24px] text-[#15304D]">
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>
            </View>

            <MoreScreenFooter />
          </ContentContainer>
        </ScrollView>

        <AuthGuardSheet ref={authSheetRef} />
      </SafeAreaView>
    );
  }

  const handleAddAccount = () => {
    profileSheetRef.current?.dismiss();
    router.push('/(auth)/add-identity');
  };

  const handleLogout = () => {
    logoutSheetRef.current?.present();
  };

  const handleConfirmLogout = () => {
    logoutSheetRef.current?.dismiss();
    logout();
    console.log('Logging out...');
  };

  const activeTypeLabel = activeIdentity
    ? getTypeLabel(activeIdentity.type)
    : 'فرد';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ContentContainer>
          {activeIdentity ? (
            <AccountProfileHeaderCard
              avatarUrl={avatarUrl}
              displayName={displayName}
              contact={user?.email || user?.phone || ''}
              typeLabel={activeTypeLabel}
              onPressType={() => profileSheetRef.current?.present()}
              onEditProfile={() => router.push('/edit-profile')}
            />
          ) : (
            <ProfileHeaderCardSkeleton />
          )}

          <IndividualMenuSections
            unreadChatCount={unreadChatCount}
            unreadNotificationsCount={unreadNotificationsCount}
          />

          {/* Logout Button */}
          <View className="mt-8 px-5">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white py-4"
            >
              <Feather name="log-out" size={18} color="#9C1E28" />
              <Text className="font-cairo-bold text-[15px] leading-[24px] text-[#9C1E28]">
                تسجيل الخروج
              </Text>
            </TouchableOpacity>
          </View>

          <MoreScreenFooter />
        </ContentContainer>
      </ScrollView>

      <ProfileBottomSheet
        ref={profileSheetRef}
        onAddAccount={handleAddAccount}
      />

      <LogoutBottomSheet
        ref={logoutSheetRef}
        onLogout={handleConfirmLogout}
        onCancel={() => logoutSheetRef.current?.dismiss()}
      />
    </SafeAreaView>
  );
}
