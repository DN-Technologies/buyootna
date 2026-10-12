import apiClient from '@/shared/api/api';

/** A subscription period a company can buy (الباقات). */
export interface CompanyPlan {
  id: string;
  slug: string;
  name: string;
  durationMonths: number;
  // KWD
  price: number;
  features: string[];
  // e.g. 'الأكثر طلبا'
  badge: string | null;
}

export interface SubscribedPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  features: string[];
}

/** One paid period in سجل الباقات. */
export interface CompanySubscriptionHistoryItem {
  id: string;
  displayId: string;
  planName: string;
  startsAt: string;
  endsAt: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface CompanySubscriptionState {
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'NONE';
  // The plan of the latest paid period; null on a trial or with none
  currentPlanId: string | null;
  // The plan last paid for, running or expired; null if only the trial ran.
  // Older APIs omit it.
  plan?: SubscribedPlan | null;
  endsAt: string | null;
  daysLeft: number;
}

export const companySubscriptionsService = {
  getPlans: async (): Promise<CompanyPlan[]> => {
    const response = await apiClient.get<CompanyPlan[]>('/company-plans');
    return response.data;
  },

  getMine: async (): Promise<CompanySubscriptionState> => {
    const response = await apiClient.get<CompanySubscriptionState>(
      '/company-subscriptions/me',
    );
    return response.data;
  },

  getHistory: async (): Promise<CompanySubscriptionHistoryItem[]> => {
    const response = await apiClient.get<CompanySubscriptionHistoryItem[]>(
      '/company-subscriptions/history',
    );
    return response.data;
  },
};
