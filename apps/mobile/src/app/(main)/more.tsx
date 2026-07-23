import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShareIcon } from '@/assets/icons/home/property';
import {
  BillIcon,
  ChatIcon,
  MoneyIcon,
  QuotaIcon,
  SavedIcon,
  SettingsIcon,
  StarIcon,
} from '@/assets/icons/more';
import apiClient from '@/core/api/api';
import AuthGuardSheet from '@/core/components/AuthGuardSheet';
import ContentContainer from '@/core/components/ContentContainer';
import MenuItem from '@/core/components/more/MenuItem';
import LogoutBottomSheet from '@/features/auth/components/LogoutBottomSheet';
import ProfileBottomSheet, {
  Profile,
} from '@/features/auth/components/ProfileBottomSheet';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

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

export default function ProfileDashboardScreen() {
  const router = useRouter();
  const { user, token, logout, refreshProfile } = useAuthStore();
  const { guardAction, authSheetRef } = useAuthGuard();

  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const unreadChatCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0,
  );

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const logoutSheetRef = useRef<BottomSheetModal>(null);

  // Sync user profile state from NestJS backend when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
      }
    }, [refreshProfile, token, loadConversations]),
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
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
                      guardAction(() => router.push('/(more)/favorites'))
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
                    onPress={() => router.push('/(more)/about')}
                  />
                  <MenuItem
                    icon={HelpIcon}
                    title="الأسئلة الشائعة"
                    onPress={() => router.push('/(more)/faq')}
                  />
                  <MenuItem
                    icon={PhoneIcon}
                    title="تواصل معنا"
                    onPress={() => router.push('/(more)/contact')}
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
                    onPress={() => router.push('/(more)/privacy')}
                  />
                  <MenuItem
                    icon={FileIcon}
                    title="الشروط والأحكام"
                    onPress={() => router.push('/(more)/terms')}
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

  const getSelectedProfileId = () => {
    if (user?.role === 'COMPANY') return '2';
    if (user?.role === 'OFFICE') return '3';
    return '1';
  };

  const getProfilesList = (): Profile[] => {
    const list: Profile[] = [];

    list.push({
      id: '1',
      name:
        user?.name || (user?.email ? user.email.split('@')[0] : 'غير معروف'),
      email: user?.email || 'salinelshekh@gmail.com',
      type: 'individual',
      typeName: 'فرد',
      icon: require('@/assets/icons/individual-icon.svg'),
    });

    if (user?.companyProfile) {
      list.push({
        id: '2',
        name: user.companyProfile.name || 'شركة كيان العقارية',
        email: user.email || 'kayan@gmail.com',
        type: 'company',
        typeName: 'شركة',
        icon: require('@/assets/icons/company-icon.svg'),
      });
    }

    if (user?.officeProfile) {
      list.push({
        id: '3',
        name: user.officeProfile.name || 'مكتب سالم العقاري',
        email: user.email || 'salinelshekh@gmail.com',
        type: 'owner',
        typeName: 'مالك عقار',
        icon: require('@/assets/icons/owner-icon.svg'),
      });
    }

    return list;
  };

  const getActiveProfileDetails = () => {
    if (user?.role === 'COMPANY' && user.companyProfile) {
      return {
        name: user.companyProfile.name || 'شركة كيان العقارية',
        avatarUrl:
          user.companyProfile.logoUrl || 'https://via.placeholder.com/150',
      };
    }
    if (user?.role === 'OFFICE' && user.officeProfile) {
      return {
        name: user.officeProfile.name || 'مكتب سالم العقاري',
        avatarUrl:
          user.officeProfile.logoUrl || 'https://via.placeholder.com/150',
      };
    }
    return {
      name:
        user?.name || (user?.email ? user.email.split('@')[0] : 'غير معروف'),
      avatarUrl: user?.avatarUrl || 'https://via.placeholder.com/150',
    };
  };

  const { name: activeName, avatarUrl: activeAvatarUrl } =
    getActiveProfileDetails();

  const handleProfileSelect = async (profile: Profile) => {
    const mappedRole =
      profile.type === 'company'
        ? 'COMPANY'
        : profile.type === 'owner'
          ? 'OFFICE'
          : 'INDIVIDUAL';
    try {
      // 1. Call backend patch route to switch active role
      await apiClient.patch('/users/role', { role: mappedRole });

      // 2. Fetch fresh profile data to update Zustand store
      await refreshProfile();

      console.log('Successfully switched active role to:', mappedRole);
    } catch (e) {
      console.error('Failed to switch role:', e);
    }
  };

  const handleAddAccount = () => {
    profileSheetRef.current?.dismiss();
    router.push('/(auth)/selection');
  };

  const handleLogout = () => {
    logoutSheetRef.current?.present();
  };

  const handleConfirmLogout = () => {
    logoutSheetRef.current?.dismiss();
    logout();
    console.log('Logging out...');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ContentContainer>
          {/* --- 1. Profile Header Card --- */}
          <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
            {/* Top Navy Blue Banner */}
            <View className="h-20 w-full bg-[#15304D]" />

            <View className="px-5 pb-5">
              {/* Avatar & Account Type Row */}
              <View className="-mt-10 mb-2 flex-row items-start justify-between">
                {/* Overlapping Avatar */}
                <View className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-gray-200 shadow-sm">
                  <Image
                    source={{
                      uri: activeAvatarUrl,
                    }} // Replace with actual user avatar
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
                    {user?.role === 'COMPANY'
                      ? 'شركة'
                      : user?.role === 'OFFICE'
                        ? 'مكتب'
                        : 'فرد'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View className="mb-5 items-start">
                <Text className="font-cairo-bold text-lg text-[#111111]">
                  {activeName}
                </Text>
                <Text className="font-cairo-medium text-xs text-[#64748B]">
                  {user?.email || 'mohamedelotby@gmail.com'}
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
                  onPress={() => router.push('/(more)/favorites')}
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
                  onPress={() =>
                    Alert.alert(
                      'قريباً',
                      'ميزة التقييمات والمراجعات ستكون متوفرة قريباً',
                    )
                  }
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
                  onPress={() =>
                    Alert.alert(
                      'قريباً',
                      'ميزة رصيد الحساب ستكون متوفرة قريباً',
                    )
                  }
                />
                <MenuItem
                  icon={BillIcon}
                  title="الفواتير"
                  onPress={() => router.push('/(more)/invoices')}
                />
                <MenuItem
                  icon={BillIcon}
                  title="فواتير الخدمات"
                  onPress={() =>
                    Alert.alert(
                      'قريباً',
                      'ميزة فواتير الخدمات ستكون متوفرة قريباً',
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
        profiles={getProfilesList()}
        selectedId={getSelectedProfileId()}
        onSelect={handleProfileSelect}
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
