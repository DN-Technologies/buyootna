import apiClient from '@/core/api/api';

export interface PlanItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  discountText: string | null;
  badge: string | null;
  features: string[];
  color: string;
}

export const plansService = {
  getPlans: async (): Promise<PlanItem[]> => {
    const response = await apiClient.get<PlanItem[]>('/plans');
    return response.data;
  },
};
