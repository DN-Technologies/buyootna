import { useCallback, useEffect, useState } from 'react';

import apiClient from '@/core/api/api';
import { useAuthStore } from '@/store/useAuthStore';

export interface ActivityItem {
  id: string;
  images: string[];
  price: number | null;
  type: string;
  category: string;
  status: 'ACTIVE' | 'DRAFT';
  updatedAt: string;
  isPremium?: boolean;
}

export function useMyActivity(status?: 'ACTIVE' | 'DRAFT') {
  const { token } = useAuthStore();
  const [data, setData] = useState<ActivityItem[]>([]);
  const [freeAdsRemaining, setFreeAdsRemaining] = useState<number>(0);
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
    isLoading,
    error,
    refetch: fetchData,
  };
}
