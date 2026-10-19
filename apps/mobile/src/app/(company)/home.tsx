import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HomeBanner,
  HomeHeader,
  HomeRequestsSection,
  HomeStatsGrid,
} from '@/features/company/components/home';
import { useCompanyHome } from '@/features/company/hooks/useCompanyHome';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';
import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import StoryTray from '@/features/stories/components/StoryTray';
import ProfileHomeSkeleton from '@/shared/components/skeletons/ProfileHomeSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useUnreadNotificationsCount } from '@/shared/hooks/notifications/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Company home (Figma 4410:164042 and its states 4410:163244 / 163631 /
 * 163863): header, four figures, one optional card (trial, no plan, no
 * services) and the two request lists.
 */
export default function CompanyHomeScreen() {
  const { activeIdentity, displayName, avatarUrl, isVerified } = useIdentity();
  const { token, refreshProfile } = useAuthStore();
  const unreadCount = useUnreadNotificationsCount();
  const conversations = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const { data: dashboard, refetch: refetchDashboard } = useCompanyHome();
  const { data: privateRequests, refetch: refetchPrivate } = useCompanyRequests(
    'company',
    'all',
    '',
  );
  const { data: publicRequests, refetch: refetchPublic } = useCompanyRequests(
    'public',
    'all',
    '',
  );

  const { services, refetch: refetchServices } = useMyCompanyServices();

  const logoUrl = avatarUrl || 'https://via.placeholder.com/150';

  const activeServicesCount = services.length;

  const unreadMessagesCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const weekAgo = Date.now() - WEEK_MS;
  const privateRequestsThisWeek = privateRequests.filter(
    (request) => new Date(request.createdAt).getTime() >= weekAgo,
  ).length;
  const acceptedRequestsCount = [...privateRequests, ...publicRequests].filter(
    (request) => request.status === 'accepted',
  ).length;

  const refresh = useCallback(() => {
    refreshProfile();
    loadConversations(1);
    refetchDashboard();
    refetchPrivate();
    refetchPublic();
    refetchServices();
  }, [
    refreshProfile,
    loadConversations,
    refetchDashboard,
    refetchPrivate,
    refetchPublic,
    refetchServices,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (token) refresh();
    }, [refresh, token]),
  );

  if (!activeIdentity) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ProfileHomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      >
        <ContentContainer>
          <HomeHeader
            logoUrl={logoUrl}
            displayName={displayName}
            isVerified={isVerified}
            unreadNotificationsCount={unreadCount}
          />
        </ContentContainer>

        {/* Stories (hidden when there are none) */}
        <StoryTray className="mt-4" />

        <ContentContainer>
          <View className="mt-5 gap-6">
            <HomeStatsGrid
              privateRequestsThisWeek={privateRequestsThisWeek}
              activeServicesCount={activeServicesCount}
              unreadMessagesCount={unreadMessagesCount}
              acceptedRequestsCount={acceptedRequestsCount}
            />

            <HomeBanner
              billing={dashboard?.billing}
              activeServicesCount={activeServicesCount}
            />

            <HomeRequestsSection
              title="طلبات خاصة بالشركة"
              variant="company"
              requests={privateRequests}
            />

            <HomeRequestsSection
              title="طلبات عامة"
              variant="public"
              requests={publicRequests}
            />
          </View>
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
