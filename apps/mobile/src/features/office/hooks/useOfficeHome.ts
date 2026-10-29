import { useQuery } from '@tanstack/react-query';

import { feedService } from '@/features/individual/services/feed.service';
import { chatService } from '@/shared/api/chat.service';
import { officeService } from '@/shared/api/office.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { PropertyDto } from '@/types/feed';

// عقارات السوق: up to this many market ads, mixed across deal types
const MARKET_LIMIT = 8;
// أحدث المحادثات
const CHATS_LIMIT = 5;

// sale, rent, exchange, sale, rent ... so one deal type doesn't fill the row
export function interleaveMarket(
  lists: PropertyDto[][],
  excludeIdentityId?: string,
  limit = MARKET_LIMIT,
): PropertyDto[] {
  const out: PropertyDto[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest && out.length < limit; i++) {
    for (const list of lists) {
      const item = list[i];
      if (item && item.identityId !== excludeIdentityId) out.push(item);
      if (out.length >= limit) break;
    }
  }
  return out;
}

function errorMessage(error: unknown): string | null {
  if (!error) return null;
  return (
    (error as any)?.response?.data?.message || 'فشل في تحميل البيانات'
  );
}

/** Everything the office home shows, one query per section. */
export function useOfficeHome() {
  const token = useAuthStore((s) => s.token);
  const identityId = useAuthStore((s) => s.activeIdentity?.id);
  const enabled = !!token && !!identityId;

  const dashboard = useQuery({
    queryKey: ['officeHome', 'dashboard', identityId],
    queryFn: officeService.getDashboard,
    enabled,
  });
  const market = useQuery({
    queryKey: ['officeHome', 'market', identityId],
    queryFn: async () => {
      const feed = await feedService.getHomeFeed();
      return interleaveMarket(
        [feed.sale, feed.rent, feed.exchange],
        identityId,
      );
    },
    enabled,
  });
  const conversations = useQuery({
    queryKey: ['officeHome', 'conversations', identityId],
    queryFn: async () =>
      (await chatService.getConversations(1, CHATS_LIMIT)).data,
    enabled,
  });

  const refetch = () =>
    Promise.all([
      dashboard.refetch(),
      market.refetch(),
      conversations.refetch(),
    ]);

  return {
    identityId,
    dashboard: dashboard.data,
    isDashboardLoading: dashboard.isLoading,
    dashboardError: errorMessage(dashboard.error),
    market: market.data ?? [],
    isMarketLoading: market.isLoading,
    conversations: conversations.data ?? [],
    refetch,
  };
}
