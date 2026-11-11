import type { PlanOption } from '@/features/individual/components/plans/constants';
import type { PlanItem, PlanPackage } from '@/shared/api/plans.service';

/** «1 اعلان عادي» / «1 اعلان مميز» (Figma 10180:55742). */
export function officeOptionLabel(pkg: PlanPackage): string {
  const featured = pkg.featuredAdsCount ?? 0;
  return featured > 0 && pkg.adsCount === 0
    ? `${featured} اعلان مميز`
    : `${pkg.adsCount} اعلان عادي`;
}

/** An office plan's packages as the card's choices, bought by id. */
export function officeOptions(plan: PlanItem): PlanOption[] {
  return (plan.packages ?? []).map((pkg) => ({
    id: pkg.id,
    packageId: pkg.id,
    slug: plan.slug,
    adsCount: pkg.adsCount,
    label: officeOptionLabel(pkg),
    price: `${pkg.price} د.ك`,
    featured: (pkg.featuredAdsCount ?? 0) > 0 && pkg.adsCount === 0,
  }));
}

/**
 * A plan with one package is a bundle (العادية, الفضية): its price is the
 * card's header. Several packages are choices (الاساسية).
 */
export const isBundlePlan = (plan: PlanItem) => (plan.packages ?? []).length === 1;
