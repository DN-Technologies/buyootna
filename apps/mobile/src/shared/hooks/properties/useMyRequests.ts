import { useQuery } from '@tanstack/react-query';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

/**
 * The price-quote requests the current identity SUBMITTED (any status) —
 * the data behind My Activity's عروضي tab.
 */
export function useMyRequests() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['myRequests'],
    queryFn: () => companyRequestsService.getMine({ scope: 'mine' }),
    enabled: !!token,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل الطلبات'
    : null;

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
