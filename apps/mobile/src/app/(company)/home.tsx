import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  COMPANY_REQUESTS_MOCK,
  CompanyAdsSection,
  CompanyConversationsSection,
  CompanyRequestsSection,
  CompanyServicesSection,
  HOME_SERVICE_CHIPS_MOCK,
  HomeBillingBanner,
  HomeHeader,
  HomeStatsGrid,
  PUBLIC_REQUESTS_MOCK,
  PublicRequestsSection,
} from '@/features/company/components/home';
import { useCompanyHome } from '@/features/company/hooks/useCompanyHome';
import ProfileHomeSkeleton from '@/shared/components/skeletons/ProfileHomeSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useMyActivity } from '@/shared/hooks/useMyActivity';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

export default function CompanyHomeScreen() {
  const { activeIdentity, displayName, avatarUrl, isVerified } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const unreadCount = useUnreadNotificationsCount();
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const { data: myAds, refetch: refetchMyAds } = useMyActivity();
  const { data: dashboard, refetch: refetchDashboard } = useCompanyHome();

  const logoUrl = avatarUrl || 'https://via.placeholder.com/150';

  // "•"-delimited list, e.g. "إدارة أملاك • وساطة عقارية • تقييم عقاري" --
  // no dedicated services endpoint exists, this is already on the identity.
  const activeServicesCount = (activeIdentity?.companyData?.services ?? '')
    .split('•')
    .map((s) => s.trim())
    .filter(Boolean).length;

  const unreadMessagesCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refreshProfile();
        loadConversations(1);
        refetchMyAds();
        refetchDashboard();
      }
    }, [refreshProfile, loadConversations, refetchMyAds, refetchDashboard, token]),
  );

  if (!activeIdentity) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <ProfileHomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refreshProfile();
            }}
          />
        }
      >
        <ContentContainer className="px-5">
          {/* Top Header Bar */}
          <HomeHeader
            logoUrl={logoUrl}
            displayName={displayName}
            isVerified={isVerified}
            unreadNotificationsCount={unreadCount}
          />

          {/* 2x2 Stats Grid */}
          <HomeStatsGrid
            requestsCount={COMPANY_REQUESTS_MOCK.length}
            activeServicesCount={activeServicesCount}
            totalViews={dashboard?.listings.totalViews ?? 0}
            unreadMessagesCount={unreadMessagesCount}
          />

          {/* Billing / Subscription Banner */}
          <HomeBillingBanner billing={dashboard?.billing} />

          {/* Company Requests Section */}
          <CompanyRequestsSection requests={COMPANY_REQUESTS_MOCK} />

          {/* Public Requests Section */}
          <PublicRequestsSection requests={PUBLIC_REQUESTS_MOCK} />

          {/* Services Section */}
          <CompanyServicesSection services={HOME_SERVICE_CHIPS_MOCK} />

          {/* Advertisements Section */}
          <CompanyAdsSection ads={myAds ?? []} />

          {/* Latest Conversations Section */}
          <CompanyConversationsSection conversations={conversations} />
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
