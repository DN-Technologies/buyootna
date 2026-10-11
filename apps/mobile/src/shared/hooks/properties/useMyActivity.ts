import { useQuery } from '@tanstack/react-query';

import apiClient from '@/shared/api/api';
import { plansService, type UserWallet } from '@/shared/api/plans.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export type ActivityListingStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CLOSED';

export interface ActivityItem {
  id: string;
  images: string[];
  price: number | null;
  type: string;
  category: string;
  status: ActivityListingStatus;
  updatedAt: string;
  createdAt?: string;
  publishedAt?: string | null;
  endDate?: string | null;
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
  status?: ActivityListingStatus,
): Promise<MyActivityData> {
  const [activityResponse, userResponse, wallet] = await Promise.all([
    apiClient.get<ActivityItem[]>('/properties/me/activity', {
      params: status ? { status } : undefined,
    }),
    apiClient.get('/users/me'),
    // A wallet failure must not take down the ad list -- fall back to the
    // free-quota banner instead.
    plansService.getWallet().catch(() => null),
  ]);

  const subscription = subscriptionFromWallet(wallet);

  return {
    activity: activityResponse.data,
    freeAdsRemaining: userResponse.data?.user?.freeAdsRemaining ?? 0,
    hasSubscription: !!subscription,
    subscription,
  };
}

/**
 * Remaining paid-package ads per tier, from the real wallet (the same
 * GET /plans/wallet balanceCounts رصيد الحساب shows). /users/me's
 * `hasSubscription`/`subscription` are hardcoded placeholders on the API,
 * so purchased packages never showed up on My Activity (QA).
 */
export function subscriptionFromWallet(
  wallet: UserWallet | null | undefined,
): SubscriptionInfo | undefined {
  const counts = wallet?.balanceCounts;
  if (!counts) return undefined;
  const subscription: SubscriptionInfo = {
    goldRemaining: counts.gold ?? 0,
    silverRemaining: counts.silver ?? 0,
    normalRemaining: counts.regular ?? 0,
  };
  const total =
    subscription.goldRemaining +
    subscription.silverRemaining +
    subscription.normalRemaining;
  return total > 0 ? subscription : undefined;
}

export function useMyActivity(status?: ActivityListingStatus) {
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

export async function archiveProperty(propertyId: string) {
  const response = await apiClient.post(`/properties/${propertyId}/archive`);
  return response.data;
}

export async function renewProperty(propertyId: string, planSlotId?: string) {
  const response = await apiClient.post(`/properties/${propertyId}/renew`, {
    planSlotId,
  });
  return response.data;
}
