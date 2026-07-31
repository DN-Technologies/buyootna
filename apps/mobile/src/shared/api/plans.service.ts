import apiClient from '@/shared/api/api';

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

export interface WalletSlot {
  id: string;
  planId: string;
  planName: string;
  planSlug: string;
  color?: string;
  badge?: string;
  adsRemaining: number;
  maxActiveAds: number;
  createdAt: string;
}

export interface UserWallet {
  freeAdsRemaining: number;
  slots: WalletSlot[];
}

export interface PublishOption {
  type: 'FREE_QUOTA' | 'PLAN_SLOT';
  slotId: string;
  title: string;
  subtitle: string;
  planName: string;
  color: string;
  adsRemaining: number;
  durationDays: number;
  maxImagesPerAd: number;
  featuredDays: number;
  prioritySearch: boolean;
}

export interface PublishOptionsResponse {
  canPublish: boolean;
  options: PublishOption[];
}

export const plansService = {
  getPlans: async (): Promise<PlanItem[]> => {
    const response = await apiClient.get<PlanItem[]>('/plans');
    return response.data;
  },

  getWallet: async (): Promise<UserWallet> => {
    const response = await apiClient.get<UserWallet>('/plans/wallet');
    return response.data;
  },

  getPublishOptions: async (): Promise<PublishOptionsResponse> => {
    const response = await apiClient.get<PublishOptionsResponse>(
      '/plans/wallet/publish-options',
    );
    return response.data;
  },
};
