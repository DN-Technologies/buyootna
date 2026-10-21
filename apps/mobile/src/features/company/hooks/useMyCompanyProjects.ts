import { useQuery } from '@tanstack/react-query';

import { companyService } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

// The projects the company added through "اضافة مشروع"
export function useMyCompanyProjects() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['companyProjects'],
    queryFn: companyService.getMyProjects,
    enabled: !!token,
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
