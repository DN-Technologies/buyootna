import type {
  PlanOption,
  PlanTier,
} from '@/features/individual/components/plans/constants';
import type { PlanItem } from '@/shared/api/plans.service';

/** «باقة 1 اعلان» / «باقة 3 اعلانات»: the Arabic count (3–10 plural). */
export function packageLabel(adsCount: number): string {
  const plural = adsCount >= 3 && adsCount <= 10;
  return `باقة ${adsCount} ${plural ? 'اعلانات' : 'اعلان'}`;
}

/**
 * A tier's options are the packages the backend sells for its plan, so a
 * new price or ad count set in admin shows (and is bought) as is. The
 * hardcoded options are only the fallback while plans load or if the API
 * has none: they named counts the backend no longer sold (QA: prices).
 */
export function tierOptions(tier: PlanTier, plans: PlanItem[]): PlanOption[] {
  const slug = tier.options[0]?.slug;
  const packages = plans.find((p) => p.slug === slug)?.packages ?? [];
  if (packages.length === 0) return tier.options;
  return packages.map((pkg) => ({
    id: `${tier.id}-${pkg.adsCount}`,
    slug: slug!,
    adsCount: pkg.adsCount,
    label: packageLabel(pkg.adsCount),
    price: `${pkg.price} د.ك`,
  }));
}

/** The plan's feature lines from the backend (admin-editable), else the tier's. */
export function tierFeatures(tier: PlanTier, plans: PlanItem[]): string[] {
  const slug = tier.options[0]?.slug;
  const features = plans.find((p) => p.slug === slug)?.features ?? [];
  return features.length > 0 ? features : tier.features;
}
