import { useQuery } from '@tanstack/react-query';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import {
  RequestListFilters,
  RequestListTab,
  RequestScope,
} from '../components/requests/types';

export function useCompanyRequests(
  scope: RequestScope,
  tab: RequestListTab,
  search: string,
  filters: RequestListFilters = {},
) {
  const { token } = useAuthStore();
  // المفضلة is every saved request, whatever its status
  const saved = tab === 'saved';
  const status = saved ? 'all' : tab;

  const query = useQuery({
    queryKey: ['companyRequests', scope, tab, search, filters],
    queryFn: () =>
      companyRequestsService.getMine({
        scope,
        status,
        search,
        ...filters,
        ...(saved ? { saved: true } : {}),
      }),
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
