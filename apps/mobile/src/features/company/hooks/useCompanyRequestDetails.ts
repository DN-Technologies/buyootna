import { useQuery } from '@tanstack/react-query';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function useCompanyRequestDetails(id: string | undefined) {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['companyRequest', id],
    queryFn: () => companyRequestsService.getById(id as string),
    enabled: !!token && !!id,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل الطلب'
    : null;

  return {
    data: query.data,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
