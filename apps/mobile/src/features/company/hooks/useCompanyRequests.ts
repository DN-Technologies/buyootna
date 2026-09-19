import { useQuery } from '@tanstack/react-query';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { RequestScope, RequestStatusFilter } from '../components/requests/types';

export function useCompanyRequests(
  scope: RequestScope,
  status: RequestStatusFilter,
  search: string,
) {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['companyRequests', scope, status, search],
    queryFn: () => companyRequestsService.getMine({ scope, status, search }),
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
