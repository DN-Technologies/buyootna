import { useQuery } from '@tanstack/react-query';

import { alertsService } from '@/shared/api/alerts.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Live listings that match one of the user's alerts
export function useAlertMatches(alertId: string | undefined) {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['alertMatches', alertId],
    queryFn: () => alertsService.getMatches(alertId!),
    enabled: !!token && !!alertId,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message ||
      'فشل في تحميل العقارات المطابقة'
    : null;

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error,
    refetch: query.refetch,
  };
}
