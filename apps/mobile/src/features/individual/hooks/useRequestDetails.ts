import { useQuery } from '@tanstack/react-query';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

/** One request the current identity submitted, for its details screen. */
export function useRequestDetails(id?: string) {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['myRequest', id],
    queryFn: () => companyRequestsService.getById(id as string),
    enabled: !!token && !!id,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل الطلب'
    : null;

  return {
    request: query.data,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
