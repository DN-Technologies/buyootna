import { GOLD_TIER } from '@/features/individual/components/plans/constants';
import { withApiPrice } from '@/features/individual/utils/planPricing';
import type { PlanItem } from '@/shared/api/plans.service';

const goldPlan = (packages?: PlanItem['packages']): PlanItem => ({
  id: 'gold-plan',
  slug: 'gold',
  name: 'الذهبية',
  price: 12,
  originalPrice: null,
  discountText: null,
  badge: null,
  features: [],
  color: '#15304D',
  packages,
});

const gold5 = GOLD_TIER.options[1];

describe('withApiPrice', () => {
  it('uses the matching package price from the API', () => {
    const result = withApiPrice(gold5, [
      goldPlan([{ id: 'pkg', adsCount: 5, price: 55 }]),
    ]);
    expect(result).toEqual({ ...gold5, price: '55 د.ك' });
  });

  it('keeps the hardcoded price when no package matches the ad count', () => {
    const result = withApiPrice(gold5, [
      goldPlan([{ id: 'pkg', adsCount: 1, price: 12 }]),
    ]);
    expect(result).toBe(gold5);
  });

  it('keeps the hardcoded price when the API has no packages or plan', () => {
    expect(withApiPrice(gold5, [goldPlan()])).toBe(gold5);
    expect(withApiPrice(gold5, [])).toBe(gold5);
  });
});
