import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BillIcon,
  ChatIcon,
  LogoutDoorIcon,
  MoneyIcon,
  PortfolioIcon,
  QuotaIcon,
  SavedIcon,
  ServiceInvoicesIcon,
  ServicesOutlineIcon,
  SettingsIcon,
  StarIcon,
} from '@/assets/icons/more';
import LogoutBottomSheet from '@/features/auth/components/LogoutBottomSheet';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import CompanyProfileCard from '@/features/company/components/CompanyProfileCard';
import MenuItem from '@/features/individual/components/more/MenuItem';
import ContentContainer from '@/shared/components/ContentContainer';
import ProfileHeaderCardSkeleton from '@/shared/components/skeletons/ProfileHeaderCardSkeleton';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';

export default function CompanyMoreScreen() {
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
    router.push('/edit-profile');
  };

  const handlePreviewProfile = () => {
    if (activeIdentity?.id) {
      router.push(`/company/${activeIdentity.id}`);
    } else {
      showAlert('معاينة', 'لا يمكن معاينة الملف الشخصي حالياً');
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `تعرف على ${displayName || 'المنار للعقارات'} على تطبيق بيوتنا: https://buyootna.com/company/${activeIdentity?.id || ''}`,
      });
    } catch {
      // ignore
    }
  };

  const activeTypeLabel = activeIdentity
    ? getTypeLabel(activeIdentity.type)
    : 'شركة';

  const companyBio =
    activeIdentity?.companyData?.about ||
    'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.';

  const companyLocation =
    activeIdentity?.companyData?.hqLocation ||
    activeIdentity?.companyData?.serviceAreas ||
    'السالمية • شمال غرب صليبيخات';

  const finalDisplayName =
    displayName || activeIdentity?.companyData?.name || 'المنار للعقارات';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <ContentContainer>
          {/* --- 1. Company Profile Header Card --- */}
          {activeIdentity ? (
            <CompanyProfileCard
              displayName={finalDisplayName}
              avatarUrl={avatarUrl}
              accountTypeLabel={activeTypeLabel}
              isVerified={isVerified}
              description={companyBio}
              location={companyLocation}
              onOpenAccountSelector={() => profileSheetRef.current?.present()}
              onEditPress={handleEditProfile}
              onPreviewPress={handlePreviewProfile}
              onSharePress={handleShareProfile}
            />
          ) : (
            <ProfileHeaderCardSkeleton />
          )}

          {/* --- 2. Menu Sections --- */}
          <View className="gap-5 px-4">
            {/* إدارة الأعمال (Business Management) */}
            <View>
              <Text
                className="mb-2 px-1 font-cairo-semibold text-[14px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                ادارة الأعمال
              </Text>
              <View className="rounded-[6px] bg-[#F9FAFE] px-3 py-1">
                <MenuItem
                  icon={ServicesOutlineIcon}
                  title="الخدمات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/(company)/add-service')}
                />
                <MenuItem
                  icon={PortfolioIcon}
                  title="معرض الأعمال"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/(company)/add-project')}
                />
                <MenuItem
                  icon={ServiceInvoicesIcon}
                  title="فواتير الخدمات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/(company)/create-invoice')}
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
                  badgeCount={unreadChatCount > 0 ? unreadChatCount : 3}
                  badgeColor="#9C1E28"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/(company)/company-chats')}
                />
                <MenuItem
                  icon={SavedIcon}
                  title="المحفوظات"
                  compact
                  chevronColor="#6B6A6A"
                  onPress={() => router.push('/favorites')}
                />
              </View>
            </View>

            {/* التقييمات (Ratings) */}
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

            {/* --- 3. Logout Button --- */}
            <View className="mt-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogout}
                className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white"
              >
                <LogoutDoorIcon size={16} color="#9C1E28" />
                <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#9C1E28]">
                  تسجيل الخروج
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text
              className="mt-2 text-center font-cairo-medium text-[13px] text-[#A0A0A0]"
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

