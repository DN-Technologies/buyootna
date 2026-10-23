import { useQuery } from '@tanstack/react-query';

import { companyService } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

// The services the company added through "اضافة خدمة", with its specialty
export function useMyCompanyServices() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['companyServices'],
    queryFn: companyService.getMyServices,
    enabled: !!token,
  });

  return {
    services: query.data?.services ?? [],
    specialty: query.data?.specialty ?? null,
    servicesHidden: query.data?.servicesHidden ?? false,
    description: query.data?.description ?? null,
    createdAt: query.data?.createdAt ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
