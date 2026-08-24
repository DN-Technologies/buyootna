import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShareIcon } from '@/assets/icons/home/property';
import {
  AuctionsIcon,
  BillIcon,
  ChatIcon,
  DealsIcon,
  MoneyIcon,
  QuotaIcon,
  SavedIcon,
  SettingsIcon,
  StarIcon,
} from '@/assets/icons/more';
import LogoutBottomSheet from '@/features/auth/components/LogoutBottomSheet';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import MenuItem from '@/features/individual/components/more/MenuItem';
import { useTabBarHeight } from '@/features/individual/hooks/useTabBarHeight';
import AuthGuardSheet from '@/shared/components/AuthGuardSheet';
import ContentContainer from '@/shared/components/ContentContainer';
import ProfileHeaderCardSkeleton from '@/shared/components/skeletons/ProfileHeaderCardSkeleton';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';

const InfoIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="info" color={color} size={size} />
);
const HelpIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="help-circle" color={color} size={size} />
);
const PhoneIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="phone" color={color} size={size} />
);
const ShieldIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="shield" color={color} size={size} />
);
const FileIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="file-text" color={color} size={size} />
);
const BellIcon = ({ color, size }: { color?: string; size?: number }) => (
  <Feather name="bell" color={color} size={size} />
);

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
            {/* --- 1. Profile Greeting Card --- */}
            <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
              {/* Top Navy Blue Banner */}
              <View className="h-20 w-full bg-[#15304D]" />

              <View className="px-5 pb-5 pt-3">
                {/* Avatar Outline & Greeting */}
                <View className="-mt-10 mb-4 flex-row items-end justify-between">
                  <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-gray-200 shadow-sm">
                    <Feather name="user" size={36} color="#94A3B8" />
                  </View>
                </View>

                <View className="mb-4 items-start">
                  <Text className="font-cairo-bold text-lg text-[#111111]">
                    مرحبا بك !
                  </Text>
                  <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
                    أنشئ حسابك للوصول إلى جميع المميزات
                  </Text>
                </View>

                {/* Create Account Link */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/selection')}
                  className="w-full flex-row items-center justify-center rounded-[24px] bg-[#15304D] py-2.5"
                >
                  <Text className="font-cairo-bold text-sm leading-[22px] text-white">
                    إنشاء حساب
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- 2. Menu Sections --- */}
            <View className="gap-6 px-5">
              {/* Activity Section */}
              <View>
                <Text
                  className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  نشاطي
                </Text>
                <View className="rounded-md bg-[#F9FAFE] px-4">
                  <MenuItem
                    icon={ChatIcon}
                    title="المحادثات"
                    onPress={() => guardAction(() => router.push('/chat'))}
                  />
                  <MenuItem
                    icon={SavedIcon}
                    title="المحفوظات"
                    onPress={() =>
                      guardAction(() => router.push('/favorites'))
                    }
                  />
                  <MenuItem
                    icon={BellIcon}
                    title="الاشعارات"
                    onPress={() =>
                      guardAction(() => router.push('/notification-list'))
                    }
                  />
                </View>
              </View>

              {/* Services Section */}
              <View>
                <Text
                  className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  الخدمات
                </Text>
                <View className="rounded-md bg-[#F9FAFE] px-4">
                  <MenuItem
                    icon={DealsIcon}
                    title="الصفقات"
                    onPress={() =>
                      showAlert(
                        'قريباً',
                        'ميزة الصفقات ستكون متوفرة قريباً'
                      )
                    }
                  />
                  <MenuItem
                    icon={AuctionsIcon}
                    title="المزادات"
                    onPress={() =>
                      showAlert(
                        'قريباً',
                        'ميزة المزادات ستكون متوفرة قريباً'
                      )
                    }
                  />
                </View>
              </View>

              {/* Support & Help Section */}
              <View>
                <Text
                  className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  الدعم والمساعدة
                </Text>
                <View className="rounded-md bg-[#F9FAFE] px-4">
                  <MenuItem
                    icon={InfoIcon}
                    title="عن بيوتنا"
                    onPress={() => router.push('/about')}
                  />
                  <MenuItem
                    icon={HelpIcon}
                    title="الأسئلة الشائعة"
                    onPress={() => router.push('/faq')}
                  />
                  <MenuItem
                    icon={PhoneIcon}
                    title="تواصل معنا"
                    onPress={() => router.push('/contact')}
                  />
                </View>
              </View>

              {/* Policies Section */}
              <View>
                <Text
                  className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  السياسات
                </Text>
                <View className="rounded-md bg-[#F9FAFE] px-4">
                  <MenuItem
                    icon={ShieldIcon}
                    title="سياسة الخصوصية"
                    onPress={() => router.push('/privacy')}
                  />
                  <MenuItem
                    icon={FileIcon}
                    title="الشروط والأحكام"
                    onPress={() => router.push('/terms')}
                  />
                </View>
              </View>
            </View>

            {/* --- 3. Login Button --- */}
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

            {/* Footer */}
            <Text className="mt-6 text-center font-cairo-medium text-xs text-[#6B6A6A]">
              تم انشاء وتطوير التطبيق بواسطة دار النخبة
            </Text>
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

  const activeAvatarUrl = avatarUrl || 'https://via.placeholder.com/150';
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
          {/* --- 1. Profile Header Card --- */}
          {activeIdentity ? (
            <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
              {/* Top Navy Blue Banner */}
              <View className="h-20 w-full bg-[#15304D]" />

              <View className="px-5 pb-5">
                {/* Avatar & Account Type Row */}
                <View className="-mt-10 mb-2 flex-row items-start justify-between">
                  {/* Overlapping Avatar */}
                  <View className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-gray-200 shadow-sm">
                    <Image
                      source={{ uri: activeAvatarUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>

                  {/* Account Type Selector */}
                  <TouchableOpacity
                    onPress={() => profileSheetRef.current?.present()}
                    className="mt-20 w-[72px] flex-row items-center justify-center gap-3 rounded-full bg-[#F9FAFE] px-3 py-1"
                  >
                    <Text className="font-cairo-bold text-[14px] leading-[22px] text-[#15304D]">
                      {activeTypeLabel}
                    </Text>
                    <Feather name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View className="mb-5 items-start">
                  <Text className="font-cairo-bold text-lg text-[#111111]">
                    {displayName}
                  </Text>
                  <Text className="font-cairo-medium text-xs text-[#64748B]">
                    {user?.email || user?.phone || ''}
                  </Text>
                </View>

                {/* Action Buttons Row */}
                <View className="flex-row justify-between gap-2">
                  <TouchableOpacity
                    onPress={() => router.push('/edit-profile')}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#15304D] py-2.5"
                  >
                    <Feather name="edit-2" size={14} color="#FFFFFF" />
                    <Text className="font-cairo-bold text-sm leading-[22px] text-white">
                      تعديل
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] border border-gray-100 bg-gray-50 py-2.5">
                    <Feather name="eye" size={14} color="#111111" />
                    <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
                      معاينة
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] border border-gray-100 bg-gray-50 py-2.5">
                    <ShareIcon color="#111111" size={14} />
                    <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
                      مشاركة
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <ProfileHeaderCardSkeleton />
          )}

          {/* --- 2. Menu Sections --- */}
          <View className="gap-6 px-5">
            {/* Activity Section */}
            <View>
              <Text
                className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                نشاطي
              </Text>
              <View className="rounded-md bg-[#F9FAFE] px-4">
                <MenuItem
                  icon={ChatIcon}
                  title="المحادثات"
                  badgeCount={unreadChatCount}
                  onPress={() => router.push('/chat')}
                />
                <MenuItem
                  icon={SavedIcon}
                  title="المحفوظات"
                  onPress={() => router.push('/favorites')}
                />
                <MenuItem
                  icon={BellIcon}
                  title="الاشعارات"
                  badgeCount={unreadNotificationsCount}
                  onPress={() => router.push('/notification-list')}
                />
              </View>
            </View>

            {/* Services Section */}
            <View>
              <Text
                className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                الخدمات
              </Text>
              <View className="rounded-md bg-[#F9FAFE] px-4">
                <MenuItem
                  icon={DealsIcon}
                  title="الصفقات"
                  onPress={() =>
                    showAlert('قريباً', 'ميزة الصفقات ستكون متوفرة قريباً')
                  }
                />
                <MenuItem
                  icon={AuctionsIcon}
                  title="المزادات"
                  onPress={() =>
                    showAlert('قريباً', 'ميزة المزادات ستكون متوفرة قريباً')
                  }
                />
              </View>
            </View>

            {/* Ratings Section */}
            <View>
              <Text
                className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                التقييمات
              </Text>
              <View className="rounded-md bg-[#F9FAFE] px-4">
                <MenuItem
                  icon={StarIcon}
                  title="التقييمات والمراجعات"
                  onPress={() => router.push('/reviews')}
                />
              </View>
            </View>

            {/* Account & Subscriptions Section */}
            <View>
              <Text
                className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                الحساب والاشتراك
              </Text>
              <View className="rounded-md bg-[#F9FAFE] px-4">
                <MenuItem
                  icon={QuotaIcon}
                  title="الباقات"
                  onPress={() => router.push('/plans')}
                />
                <MenuItem
                  icon={MoneyIcon}
                  title="رصيد الحساب"
                  onPress={() => router.push('/account-balance')}
                />
                <MenuItem
                  icon={BillIcon}
                  title="الفواتير"
                  onPress={() => router.push('/invoices')}
                />
                <MenuItem
                  icon={BillIcon}
                  title="فواتير الخدمات"
                  onPress={() =>
                    showAlert(
                      'قريباً',
                      'ميزة فواتير الخدمات ستكون متوفرة قريباً'
                    )
                  }
                />
              </View>
            </View>

            {/* Settings Section */}
            <View>
              <Text
                className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                الإعدادات
              </Text>
              <View className="rounded-md bg-[#F9FAFE] px-4">
                <MenuItem
                  icon={SettingsIcon}
                  title="اعدادات الحساب"
                  onPress={() => router.push('/settings')}
                />
              </View>
            </View>
          </View>

          {/* --- 3. Logout Button --- */}
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

          {/* Footer */}
          <Text className="mt-6 text-center font-cairo-medium text-xs text-[#6B6A6A]">
            تم انشاء وتطوير التطبيق بواسطة دار النخبة
          </Text>
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
