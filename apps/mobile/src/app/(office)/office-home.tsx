import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function OfficeHomeScreen() {
  const router = useRouter();
  const { activeIdentity, displayName, avatarUrl, isVerified } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const unreadCount = useUnreadNotificationsCount();
  const [refreshing, setRefreshing] = useState(false);

  const officeName = displayName || 'الفيروز';
  const officeLogo = avatarUrl || undefined;

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ContentContainer className="px-4">
          {/* 1. Header */}
          <OfficeHomeHeader
            displayName={officeName}
            logoUrl={officeLogo}
            isVerified={isVerified ?? true}
            unreadNotificationsCount={unreadCount}
            onPressNotifications={() => router.push('/notification-list')}
          />

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
    </SafeAreaView>
  );
}
