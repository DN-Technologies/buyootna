import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  CompanyDetailsResponse,
  companyService,
} from '@/shared/api/company.service';
import { showAlert } from '@/shared/utils/alert';

export function useCompanyDetails(id?: string) {
  const {
    data: company,
    isLoading,
    isError,
    refetch,
  } = useQuery<CompanyDetailsResponse>({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyDetails(String(id)),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (isError) {
      showAlert('خطأ', 'تعذر تحميل بيانات الشركة');
    }
  }, [isError]);

  return {
    company,
    isLoading,
    isError,
    refetch,
    services: company?.services ?? [],
    projects: company?.projects ?? [],
    targetUserId: company?.userId || (id ? String(id) : ''),
  };
}
