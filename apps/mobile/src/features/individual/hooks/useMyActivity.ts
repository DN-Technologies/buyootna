import { useQuery } from '@tanstack/react-query';

import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';

export interface ActivityItem {
  id: string;
  images: string[];
  price: number | null;
  type: string;
  category: string;
  status: 'ACTIVE' | 'DRAFT';
  updatedAt: string;
  isPremium?: boolean;
  isHidden?: boolean;

  // Detailed fields for previewing listings
  location?: string;
  description?: string;
  automatedNumber?: string | null;
  beds?: number | null;
  baths?: number | null;
  areaSize?: number | null;
  floors?: number | null;
  views?: number;
  features?: any[] | null;
}

export interface SubscriptionInfo {
  goldRemaining: number;
  silverRemaining: number;
  normalRemaining: number;
}

interface MyActivityData {
  activity: ActivityItem[];
  freeAdsRemaining: number;
  hasSubscription: boolean;
  subscription?: SubscriptionInfo;
}

async function fetchMyActivity(
  status?: 'ACTIVE' | 'DRAFT',
): Promise<MyActivityData> {
  const [activityResponse, userResponse] = await Promise.all([
    apiClient.get<ActivityItem[]>('/properties/me/activity', {
      params: status ? { status } : undefined,
    }),
    apiClient.get('/users/me'),
  ]);

  return {
    activity: activityResponse.data,
    freeAdsRemaining: userResponse.data?.user?.freeAdsRemaining ?? 0,
    hasSubscription: userResponse.data?.user?.hasSubscription ?? false,
    subscription: userResponse.data?.user?.subscription,
  };
}

export function useMyActivity(status?: 'ACTIVE' | 'DRAFT') {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['myActivity', status],
    queryFn: () => fetchMyActivity(status),
    enabled: !!token,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل البيانات'
    : null;

  return {
    data: query.data?.activity ?? [],
    freeAdsRemaining: query.data?.freeAdsRemaining ?? 0,
    hasSubscription: query.data?.hasSubscription ?? false,
    subscription: query.data?.subscription,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
