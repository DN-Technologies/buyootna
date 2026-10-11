import { useQuery } from '@tanstack/react-query';

import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';

export interface CompanyDashboardData {
  listings: {
    activeCount: number;
    totalViews: number;
  };
  billing: {
    hasActivePlan: boolean;
    activePlanName: string | null;
    adsRemaining: number;
    hasOverdueInvoice: boolean;
    // Days left of a trial plan. The API doesn't send it yet: the trial
    // notice on the home stays hidden until it does.
    trialDaysLeft?: number | null;
  };
}

async function fetchCompanyDashboard(): Promise<CompanyDashboardData> {
  const response = await apiClient.get<CompanyDashboardData>(
    '/companies/me/dashboard',
  );
  return response.data;
}

export function useCompanyHome() {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['companyDashboard'],
    queryFn: fetchCompanyDashboard,
    enabled: !!token,
  });

  const error = query.error
    ? (query.error as any)?.response?.data?.message || 'فشل في تحميل البيانات'
    : null;

  return {
    data: query.data,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
