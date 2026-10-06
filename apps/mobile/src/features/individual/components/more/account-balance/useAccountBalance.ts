import { useQuery } from '@tanstack/react-query';

import {
  plansService,
  type UserWallet,
  type WalletBalanceCounts,
  type WalletHistoryItem,
} from '@/shared/api/plans.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export const EMPTY_BALANCE_COUNTS: WalletBalanceCounts = {
  gold: 0,
  silver: 0,
  regular: 0,
};

const HISTORY_PREVIEW_LIMIT = 3;

// The ['wallet'] key is shared with add-listing and the office add flow,
// which read `slots` — so cache the full API payload, not a trimmed copy.
async function fetchWallet(): Promise<UserWallet> {
  try {
    return await plansService.getWallet();
  } catch (e) {
    console.log('Error fetching wallet:', e);
    return { freeAdsRemaining: 0, slots: [] };
  }
}

export function useAccountBalance() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
    enabled: !!user?.id,
  });

  const history: WalletHistoryItem[] = data?.history ?? [];

  return {
    freeAdsRemaining: data?.freeAdsRemaining ?? 0,
    balanceCounts: data?.balanceCounts ?? EMPTY_BALANCE_COUNTS,
    history,
    previewHistory: history.slice(0, HISTORY_PREVIEW_LIMIT),
    hasHistory: history.length > 0,
    isLoading,
    refreshing: isRefetching,
    onRefresh: refetch,
  };
}
