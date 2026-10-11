import type { PublishOption } from '@/shared/api/plans.service';
import type { SubscriptionInfo } from '@/shared/hooks/useMyActivity';

export type RepublishMode = 'simple' | 'multi' | 'zero-credit';
export type RepublishPlanType = 'FEATURED' | 'REGULAR';

export interface RepublishCredits {
  featuredCount: number;
  regularCount: number;
  mode: RepublishMode;
  // The wallet slot each choice spends (FREE_QUOTA or a plan slot id);
  // absent when that kind of credit isn't available or wasn't looked up
  featuredSlotId?: string;
  regularSlotId?: string;
  // How long the republished ad stays up with each kind of credit
  featuredDays?: number;
  regularDays?: number;
}

function modeFor(featuredCount: number, regularCount: number): RepublishMode {
  if (featuredCount + regularCount <= 0) return 'zero-credit';
  if (featuredCount > 0 && regularCount > 0) return 'multi';
  return 'simple';
}

/**
 * Credit from the user's real wallet (GET /plans/wallet/publish-options):
 * plan slots whose plan features the ad count as featured, the free quota
 * and non-featuring plan slots as regular.
 */
export function getRepublishCreditsFromOptions(
  options: PublishOption[],
  mode?: RepublishMode,
): RepublishCredits {
  const usable = options.filter((o) => o.adsRemaining > 0);
  const featured = usable.filter(
    (o) => o.type === 'PLAN_SLOT' && o.featuredDays > 0,
  );
  // Spend the free welcome ad before any paid regular credit
  const regular = usable
    .filter((o) => !featured.includes(o))
    .sort((a, b) => Number(b.type === 'FREE_QUOTA') - Number(a.type === 'FREE_QUOTA'));

  const sum = (list: PublishOption[]) =>
    list.reduce((total, o) => total + o.adsRemaining, 0);
  const featuredCount = sum(featured);
  const regularCount = sum(regular);

  return {
    featuredCount,
    regularCount,
    mode: mode ?? modeFor(featuredCount, regularCount),
    featuredSlotId: featured[0]?.slotId,
    regularSlotId: regular[0]?.slotId,
    featuredDays: featured[0]?.durationDays,
    regularDays: regular[0]?.durationDays,
  };
}

/**
 * Fallback when the wallet options aren't available: counts from the
 * profile's free ads and subscription summary. An explicit `mode` wins.
 */
export function getRepublishCredits(
  freeAdsRemaining: number,
  subscription?: SubscriptionInfo,
  mode?: RepublishMode,
): RepublishCredits {
  const featuredCount =
    (subscription?.goldRemaining ?? 0) + (subscription?.silverRemaining ?? 0);
  const regularCount = freeAdsRemaining + (subscription?.normalRemaining ?? 0);

  return {
    featuredCount,
    regularCount,
    mode: mode ?? modeFor(featuredCount, regularCount),
  };
}

/** Which kind a confirm spends: the picked one, or the only kind there is. */
export function planTypeToSpend(
  credits: RepublishCredits,
  selected: RepublishPlanType,
): RepublishPlanType {
  if (credits.mode === 'multi') return selected;
  return credits.featuredCount > 0 && credits.regularCount <= 0
    ? 'FEATURED'
    : 'REGULAR';
}
