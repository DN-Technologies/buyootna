import { useCallback, useEffect, useState } from 'react';

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

export function useMyActivity(status?: 'ACTIVE' | 'DRAFT') {
  const { token } = useAuthStore();
  const [data, setData] = useState<ActivityItem[]>([]);
  const [freeAdsRemaining, setFreeAdsRemaining] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [activityResponse, userResponse] = await Promise.all([
        apiClient.get<ActivityItem[]>('/properties/me/activity', {
          params: status ? { status } : undefined,
        }),
        apiClient.get('/users/me'),
      ]);

      setData(activityResponse.data);
      if (userResponse.data?.user) {
        setFreeAdsRemaining(userResponse.data.user.freeAdsRemaining ?? 0);
        setHasSubscription(userResponse.data.user.hasSubscription ?? false);
        setSubscription(userResponse.data.user.subscription);
      }
    } catch (err: any) {
      console.error('Error fetching my activity:', err);
      const msg = err.response?.data?.message || 'فشل في تحميل البيانات';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    freeAdsRemaining,
    hasSubscription,
    subscription,
    isLoading,
    error,
    refetch: fetchData,
  };
}
