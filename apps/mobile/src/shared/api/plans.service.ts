import apiClient from '@/shared/api/api';

export interface PlanPackage {
  id: string;
  adsCount: number;
  price: number;
}

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
  packages?: PlanPackage[];
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
  // Ads the slot started with; absent from APIs that predate plan packages
  totalAds?: number;
  createdAt: string;
}

export interface PackageHistoryItem {
  id: string;
  displayId: string;
  planName: string;
  planSlug: string;
  status: 'ACTIVE' | 'EXPIRED';
  dateText: string;
  createdAt: string;
}

export interface WalletHistoryItem extends PackageHistoryItem {
  adsRemaining: number;
}

export interface WalletBalanceCounts {
  gold: number;
  silver: number;
  regular: number;
}

export interface UserWallet {
  freeAdsRemaining: number;
  slots: WalletSlot[];
  balanceCounts?: WalletBalanceCounts;
  history?: WalletHistoryItem[];
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
