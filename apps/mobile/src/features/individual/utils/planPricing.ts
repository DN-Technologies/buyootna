import type { PlanOption } from '@/features/individual/components/plans/constants';
import type { PlanItem } from '@/shared/api/plans.service';

// Show the price the backend will actually charge; the hardcoded price is
// the fallback while plans load or if the API has no matching package.
export function withApiPrice(option: PlanOption, plans: PlanItem[]): PlanOption {
  const pkg = plans
    .find((p) => p.slug === option.slug)
    ?.packages?.find((k) => k.adsCount === option.adsCount);
  return pkg ? { ...option, price: `${pkg.price} د.ك` } : option;
}
