import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  OfficeDetailsResponse,
  officeService,
} from '@/shared/api/office.service';
import { showAlert } from '@/shared/utils/alert';

export function useOfficeDetails(id?: string) {
  const {
    data: office,
    isLoading,
    isError,
    refetch,
  } = useQuery<OfficeDetailsResponse>({
    queryKey: ['office', id],
    queryFn: () => officeService.getOfficeDetails(String(id)),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (isError) {
      showAlert('خطأ', 'تعذر تحميل بيانات المكتب');
    }
  }, [isError]);

  return {
    office,
    isLoading,
    isError,
    refetch,
    services: office?.services ?? [],
    properties: office?.properties ?? [],
    workingHours: office?.workingHours,
    targetUserId: office?.userId || (id ? String(id) : ''),
  };
}
