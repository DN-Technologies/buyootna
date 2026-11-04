import { useQuery } from '@tanstack/react-query';

import { plansService } from '@/shared/api/plans.service';
import { useAdBalance } from '@/shared/hooks/properties/useAdBalance';

/**
 * The عادي / مميز choice on a new ad, from the user's balance:
 * - shown once the user has packages (with only the free ad it's a normal ad);
 * - a level with nothing left can't be picked (the free ad counts as a
 *   normal one);
 * - a choice is required while at least one level can be picked. With
 *   nothing left at all, publishing shows the "no balance" sheet instead.
 */
export function useAdLevelChoice() {
  const { hasPackages, normalCount, featuredCount } = useAdBalance();
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => plansService.getWallet(),
    staleTime: 0,
  });
  const freeAds = wallet?.freeAdsRemaining ?? 0;

  const normalAvailable = normalCount + freeAds > 0;
  const featuredAvailable = featuredCount > 0;

  return {
    shown: hasPackages,
    normalCount,
    featuredCount,
    normalAvailable,
    featuredAvailable,
    required: hasPackages && (normalAvailable || featuredAvailable),
  };
}
