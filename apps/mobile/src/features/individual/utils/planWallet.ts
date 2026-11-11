import type { WalletSlot } from '@/shared/api/plans.service';

export interface WalletTierBalance {
  planSlug: string;
  planName: string;
  color?: string;
  adsRemaining: number;
  totalAds: number;
  // An office credit's «اعلان مميز»
  featured?: boolean;
  // The soonest «صلاحية انتهاء الباقة» among the tier's credits (ISO)
  expiresAt?: string;
}

// One wallet row per plan tier: a tier is sold in several packages, so a user
// can hold several slots of the same tier — show their combined balance.
export function groupWalletSlots(slots: WalletSlot[]): WalletTierBalance[] {
  const byTier = new Map<string, WalletTierBalance>();

  for (const slot of slots) {
    const total =
      slot.totalAds ?? Math.max(slot.maxActiveAds, slot.adsRemaining);
    const tier = byTier.get(slot.planSlug);
    const expiresAt = slot.expiresAt ?? undefined;
    if (tier) {
      tier.adsRemaining += slot.adsRemaining;
      tier.totalAds += total;
      if (expiresAt && (!tier.expiresAt || expiresAt < tier.expiresAt)) {
        tier.expiresAt = expiresAt;
      }
    } else {
      byTier.set(slot.planSlug, {
        planSlug: slot.planSlug,
        planName: slot.planName,
        color: slot.color,
        adsRemaining: slot.adsRemaining,
        totalAds: total,
        ...(slot.featured ? { featured: true } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      });
    }
  }

  return [...byTier.values()];
}

/** «تنتهي في 11 يناير 2027»: when a tier's unused ads are lost. */
export function walletExpiryText(expiresAt: string): string {
  const date = new Date(expiresAt).toLocaleDateString('ar-KW-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `تنتهي في ${date}`;
}
