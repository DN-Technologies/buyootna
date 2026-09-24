import type { WalletSlot } from '@/shared/api/plans.service';

export interface WalletTierBalance {
  planSlug: string;
  planName: string;
  color?: string;
  adsRemaining: number;
  totalAds: number;
}

// One wallet row per plan tier: a tier is sold in several packages, so a user
// can hold several slots of the same tier — show their combined balance.
export function groupWalletSlots(slots: WalletSlot[]): WalletTierBalance[] {
  const byTier = new Map<string, WalletTierBalance>();

  for (const slot of slots) {
    const total =
      slot.totalAds ?? Math.max(slot.maxActiveAds, slot.adsRemaining);
    const tier = byTier.get(slot.planSlug);
    if (tier) {
      tier.adsRemaining += slot.adsRemaining;
      tier.totalAds += total;
    } else {
      byTier.set(slot.planSlug, {
        planSlug: slot.planSlug,
        planName: slot.planName,
        color: slot.color,
        adsRemaining: slot.adsRemaining,
        totalAds: total,
      });
    }
  }

  return [...byTier.values()];
}
