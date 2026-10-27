import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import {
  MarketPropertyCard,
  OfficeConversationCard,
  OfficeGroupCard,
  OfficeHomeHeader,
  OfficeListingCard,
  OfficeSectionHeader,
  OfficeServiceCard,
  OfficeStatsGrid,
} from '@/features/office/components/home';
import {
  MARKET_PROPERTIES_MOCK,
  OFFICE_CONVERSATIONS_MOCK,
  OFFICE_GROUPS_MOCK,
  OFFICE_LISTINGS_MOCK,
  OFFICE_SERVICES_MOCK,
  OFFICE_STATS_MOCK,
} from '@/features/office/mockData';
import StoryStudio from '@/features/stories/studio/StoryStudio';
import type { BusinessHomeMode } from '@/features/stories/studio/StudioModeSwitch';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import FadeLayer from '@/shared/components/ui/FadeLayer';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function OfficeHomeScreen() {
  const router = useRouter();
  const profileSheetRef = useRef<BottomSheetModal>(null);
  const [mode, setMode] = useState<BusinessHomeMode>('home');
  const studioOpened = useRef(false);
  if (mode === 'studio') studioOpened.current = true;
  const { activeIdentity } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);


  // Not on the first focus: the profile was just loaded (sign-in, launch or
  // a profile switch). Coming back to the home refreshes it
  const focusedBefore = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      if (focusedBefore.current) {
        refreshProfile();
      } else {
        focusedBefore.current = true;
      }
    }, [refreshProfile, token])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    if (token) {
      await refreshProfile();
    }
    setRefreshing(false);
  };

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
            <ContentContainer className="px-4">
              {/* 2. 2x2 Stats Grid */}
              <View className="mt-2">
                <OfficeStatsGrid
                  stats={OFFICE_STATS_MOCK}
                  onPressActiveListings={() =>
                    router.push('/(office)/office-properties')
                  }
                  onPressActiveServices={() =>
                    router.push('/(office)/office-properties')
                  }
                  onPressNewMessages={() => router.push('/(office)/office-chats')}
                />
              </View>

              {/* 3. Section: اعلاناتي (My Listings) */}
              <View className="mt-6">
                <OfficeSectionHeader
                  title="اعلاناتي"
                  actionText="عرض الكل"
                  onPressAction={() => router.push('/(office)/office-properties')}
                />
              </View>
            </ContentContainer>

            {/* Horizontal Listings Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 12,
                flexDirection: 'row-reverse',
              }}
              className="mt-1"
            >
              {OFFICE_LISTINGS_MOCK.map((listing) => (
                <OfficeListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() => router.push('/(office)/office-properties')}
                  onManagePress={() => router.push('/(office)/office-properties')}
                />
              ))}
            </ScrollView>

            {/* 4. Section: الخدمات النشطة (Active Services) */}
            <ContentContainer className="mt-6 px-4">
              <OfficeSectionHeader
                title="الخدمات النشطة"
                actionText="عرض الكل"
                onPressAction={() => router.push('/(office)/office-properties')}
              />
            </ContentContainer>

            {/* Horizontal Services Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 12,
                flexDirection: 'row-reverse',
              }}
              className="mt-1"
            >
              {OFFICE_SERVICES_MOCK.map((service) => (
                <OfficeServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => router.push('/(office)/office-properties')}
                  onActionPress={() => router.push('/(office)/office-properties')}
                />
              ))}
            </ScrollView>

            {/* 5. Section: عقارات قد تهمك (Market Properties) */}
            <ContentContainer className="mt-6 px-4">
              <OfficeSectionHeader
                title="عقارات قد تهمك"
                actionText="عرض الكل"
                onPressAction={() => router.push('/search')}
              />
            </ContentContainer>

            {/* Horizontal Market Properties Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 12,
                flexDirection: 'row-reverse',
              }}
              className="mt-1"
            >
              {MARKET_PROPERTIES_MOCK.map((property) => (
                <MarketPropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => router.push('/search')}
                />
              ))}
            </ScrollView>

            {/* 6. Section: أحدث المحادثات (Recent Conversations) */}
            <ContentContainer className="mt-6 px-4">
              <OfficeSectionHeader
                title="أحدث المحادثات"
                actionText="عرض الكل"
                onPressAction={() => router.push('/(office)/office-chats')}
              />
            </ContentContainer>

            {/* Horizontal Conversations Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 12,
                flexDirection: 'row-reverse',
              }}
              className="mt-1"
            >
              {OFFICE_CONVERSATIONS_MOCK.map((conversation) => (
                <OfficeConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onPress={() => router.push('/(office)/office-chats')}
                />
              ))}
            </ScrollView>

            {/* 7. Section: نشاط المجموعات (Group Activity) */}
            <ContentContainer className="mt-6 px-4">
              <OfficeSectionHeader
                title="نشاط المجموعات"
                actionText="عرض الكل"
                onPressAction={() => router.push('/(office)/office-chats')}
              />
            </ContentContainer>

            {/* Horizontal Group Activity Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 12,
                flexDirection: 'row-reverse',
              }}
              className="mt-1"
            >
              {OFFICE_GROUPS_MOCK.map((group) => (
                <OfficeGroupCard
                  key={group.id}
                  group={group}
                  onPress={() => router.push('/(office)/office-chats')}
                />
              ))}
            </ScrollView>
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
