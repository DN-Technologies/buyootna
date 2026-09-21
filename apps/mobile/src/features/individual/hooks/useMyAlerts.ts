import { useQuery } from '@tanstack/react-query';

import { alertsService } from '@/shared/api/alerts.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function useMyAlerts() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['myAlerts'],
    queryFn: alertsService.getMine,
    enabled: !!token,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل التنبيهات'
    : null;

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
