import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import HomeConversationCard from '@/features/company/components/home/HomeConversationCard';
import {
  MarketPropertyCard,
  OfficeAdsUpsellCard,
  OfficeBusinessSectors,
  OfficeHomeHeader,
  OfficeListingCard,
  OfficeSectionHeader,
  OfficeServiceCard,
  OfficeStatsGrid,
} from '@/features/office/components/home';
import { useOfficeHome } from '@/features/office/hooks/useOfficeHome';
import StoryStudio from '@/features/stories/studio/StoryStudio';
import type { BusinessHomeMode } from '@/features/stories/studio/StudioModeSwitch';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import FadeLayer from '@/shared/components/ui/FadeLayer';
import { useAuthStore } from '@/shared/store/useAuthStore';

const EDIT_PROFILE = '/(office)/(more)/office-edit-profile';

// A horizontal row of cards, first card on the right
function CardRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 12,
        flexDirection: 'row-reverse',
      }}
    >
      {children}
    </ScrollView>
  );
}

export default function OfficeHomeScreen() {
  const router = useRouter();
  const profileSheetRef = useRef<BottomSheetModal>(null);
  const [mode, setMode] = useState<BusinessHomeMode>('home');
  const studioOpened = useRef(false);
  if (mode === 'studio') studioOpened.current = true;
  const { token, refreshProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const home = useOfficeHome();
  const { dashboard } = home;

  // Not on the first focus: the profile and home were just loaded (sign-in,
  // launch or a profile switch). Coming back to the home refreshes them
  const focusedBefore = useRef(false);
  const refetchHome = home.refetch;
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      if (focusedBefore.current) {
        refreshProfile();
        refetchHome();
      } else {
        focusedBefore.current = true;
      }
    }, [refreshProfile, refetchHome, token])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await Promise.all([refreshProfile(), home.refetch()]);
    }
    setRefreshing(false);
  };

  const billing = dashboard?.billing;
  const canPublish =
    !!billing && (billing.hasActivePackage || billing.freeAdsRemaining > 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ContentContainer className="px-4">
        <OfficeHomeHeader
          mode={mode}
          onModeChange={setMode}
          onSwitchProfile={() => profileSheetRef.current?.present()}
        />
      </ContentContainer>
      <View className="flex-1">
        <FadeLayer active={mode === 'home'}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 130 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {home.isDashboardLoading ? (
              <ActivityIndicator className="py-16" color="#15304D" />
            ) : !dashboard ? (
              <View className="items-center gap-3 px-4 py-16">
                <Text
                  className="text-center font-cairo-medium text-[14px] text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {home.dashboardError ?? 'فشل في تحميل البيانات'}
                </Text>
                <TouchableOpacity
                  onPress={() => home.refetch()}
                  className="h-10 items-center justify-center rounded-full border border-[#15304D] px-6"
                  accessibilityRole="button"
                >
                  <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                    إعادة المحاولة
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ContentContainer className="mt-2 px-4">
                  <OfficeStatsGrid
                    stats={dashboard.stats}
                    onPressActiveListings={() =>
                      router.push('/(office)/office-properties')
                    }
                    onPressActiveServices={() => router.push(EDIT_PROFILE)}
                    onPressNewMessages={() => router.push('/(office)/office-chats')}
                  />
                </ContentContainer>

                {/* اعلانات المكتب: its ads, or how to get its first one up */}
                <ContentContainer className="mt-6 px-4">
                  <OfficeSectionHeader
                    title="اعلانات المكتب"
                    onPressAction={
                      dashboard.listings.length
                        ? () => router.push('/(office)/office-properties')
                        : undefined
                    }
                  />
                </ContentContainer>
                {dashboard.listings.length ? (
                  <CardRow>
                    {dashboard.listings.map((listing) => (
                      <OfficeListingCard
                        key={listing.id}
                        listing={listing}
                        onPress={() => router.push(`/property/${listing.id}`)}
                        onManagePress={() =>
                          router.push('/(office)/office-properties')
                        }
                      />
                    ))}
                  </CardRow>
                ) : (
                  <ContentContainer className="px-4">
                    <OfficeAdsUpsellCard
                      variant={canPublish ? 'start' : 'buy'}
                      onPress={() =>
                        router.push(canPublish ? '/(office)/add' : '/plans')
                      }
                    />
                  </ContentContainer>
                )}

                {/* الخدمات: from the office profile; none, no section */}
                {dashboard.services.length > 0 && (
                  <>
                    <ContentContainer className="mt-6 px-4">
                      <OfficeSectionHeader
                        title="الخدمات"
                        onPressAction={() => router.push(EDIT_PROFILE)}
                      />
                    </ContentContainer>
                    <CardRow>
                      {dashboard.services.map((service) => (
                        <OfficeServiceCard
                          key={service.title}
                          service={service}
                          onPress={() => router.push(EDIT_PROFILE)}
                        />
                      ))}
                    </CardRow>
                  </>
                )}

                {home.market.length > 0 && (
                  <>
                    <ContentContainer className="mt-6 px-4">
                      <OfficeSectionHeader
                        title="عقارات السوق"
                        onPressAction={() => router.push('/search')}
                      />
                    </ContentContainer>
                    <CardRow>
                      {home.market.map((property) => (
                        <MarketPropertyCard
                          key={property.id}
                          property={property}
                          onPress={() => router.push(`/property/${property.id}`)}
                        />
                      ))}
                    </CardRow>
                  </>
                )}

                <OfficeBusinessSectors ownIdentityId={home.identityId} />

                {home.conversations.length > 0 && (
                  <>
                    <ContentContainer className="mt-6 px-4">
                      <OfficeSectionHeader
                        title="أحدث المحادثات"
                        onPressAction={() => router.push('/(office)/office-chats')}
                      />
                    </ContentContainer>
                    <CardRow>
                      {home.conversations.map((conversation) => (
                        <HomeConversationCard
                          key={conversation.id}
                          conversation={conversation}
                        />
                      ))}
                    </CardRow>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </FadeLayer>
        {/* Mounted once first opened, then kept (its scroll and data) */}
        {studioOpened.current && (
          <FadeLayer active={mode === 'studio'}>
            <StoryStudio />
          </FadeLayer>
        )}
      </View>
      {/* A double tap on the logo: switch profile (as in المزيد) */}
      <ProfileBottomSheet
        ref={profileSheetRef}
        onAddAccount={() => {
          profileSheetRef.current?.dismiss();
          router.push('/(auth)/add-identity');
        }}
      />
    </SafeAreaView>
  );
}
