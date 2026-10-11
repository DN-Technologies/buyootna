import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BillIcon,
  ChatIcon,
  LogoutDoorIcon,
  MoneyIcon,
  PortfolioIcon,
  QuotaIcon,
  SavedIcon,
  ServicesOutlineIcon,
  SettingsIcon,
  StarIcon,
} from '@/assets/icons/more';
import LogoutBottomSheet from '@/features/auth/components/LogoutBottomSheet';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import { OfficeProfileCard } from '@/features/office/components';
import ProfileHeaderCardSkeleton from '@/shared/components/skeletons/ProfileHeaderCardSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import MenuItem from '@/shared/components/ui/MenuItem';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function OfficeMoreScreen() {
  const router = useRouter();
  const { token, logout, refreshProfile } = useAuthStore();
  const { activeIdentity, displayName, avatarUrl, getTypeLabel, isVerified } =
    useIdentity();

  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const unreadChatCount = conversations.reduce(
    (acc, conv) => acc + (conv.unreadCount || 0),
    0
  );

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const logoutSheetRef = useRef<BottomSheetModal>(null);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
      }
    }, [refreshProfile, token, loadConversations])
  );

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
  };

  const handleEditProfile = () => {
    router.push('/office-edit-profile');
  };

  const activeTypeLabel = activeIdentity
    ? getTypeLabel(activeIdentity.type)
    : 'مكتب';

  const officeBio =
    activeIdentity?.officeData?.about ||
    'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.';

  const officeLocation =
    activeIdentity?.officeData?.hqLocation ||
    'السالمية • شمال غرب صليبيخات';

  const officeLicenseNumber =
    activeIdentity?.officeData?.licenseNumber || '2454685';

  const finalDisplayName =
    displayName || activeIdentity?.officeData?.name || 'المنار للعقارات';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <ContentContainer>
          {/* --- 1. Office Profile Header Card --- */}
          {activeIdentity ? (
            <OfficeProfileCard
              displayName={finalDisplayName}
              avatarUrl={avatarUrl}
              accountTypeLabel={activeTypeLabel}
              isVerified={isVerified}
              licenseNumber={officeLicenseNumber}
              description={officeBio}
              location={officeLocation}
              onOpenAccountSelector={() => profileSheetRef.current?.present()}
              onEditPress={handleEditProfile}
            />
          ) : (
            <ProfileHeaderCardSkeleton />
          )}

          {/* --- 2. Menu Sections Matching Figma Node 4494:136610 --- */}
          <View className="gap-5 px-4">
            {/* ادارة الأعمال (Business Management) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                ادارة الأعمال
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={PortfolioIcon}
                  title="الاعلانات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/(office)/office-properties')}
                />
                <MenuItem
                  icon={ServicesOutlineIcon}
                  title="الخدمات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/add-service')}
                />
              </View>
            </View>

            {/* نشاطي (My Activity) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                نشاطي
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={ChatIcon}
                  title="المحادثات"
                  compact
                  chevronColor="#6B6A6A"
                  badgeCount={unreadChatCount || 3}
                  badgeColor="#9C1E28"
                  onPress={() => router.push('/(office)/office-chats')}
                />
                <MenuItem
                  icon={SavedIcon}
                  title="المفضلة"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/favorites')}
                />
              </View>
            </View>

            {/* التقييمات (Ratings & Reviews) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                التقييمات
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={StarIcon}
                  title="التقييمات والمراجعات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/reviews')}
                />
              </View>
            </View>

            {/* الحساب والاشتراك (Account & Subscription) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                الحساب والاشتراك
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={QuotaIcon}
                  title="الباقات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/plans')}
                />
                <MenuItem
                  icon={MoneyIcon}
                  title="رصيد الحساب"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/account-balance')}
                />
                <MenuItem
                  icon={BillIcon}
                  title="الفواتير"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/invoices')}
                />
              </View>
            </View>

            {/* الإعدادات (Settings) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                الإعدادات
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={SettingsIcon}
                  title="اعدادات الحساب"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/settings')}
                />
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-[24px] border border-[#9C1E28] bg-white"
            >
              <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#9C1E28]">
                تسجيل الخروج
              </Text>
              <LogoutDoorIcon size={16} color="#9C1E28" />
            </TouchableOpacity>

            {/* App Footer */}
            <Text
              className="mt-1 pb-4 text-center font-cairo-medium text-[14px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              تم انشاء وتطوير التطبيق بواسطة دار النخبة
            </Text>
          </View>
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
