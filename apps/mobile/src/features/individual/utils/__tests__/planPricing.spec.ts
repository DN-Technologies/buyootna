import {
  BASIC_TIER,
  GOLD_TIER,
} from '@/features/individual/components/plans/constants';
import {
  packageLabel,
  tierFeatures,
  tierOptions,
} from '@/features/individual/utils/planPricing';
import type { PlanItem } from '@/shared/api/plans.service';

const plan = (
  slug: string,
  packages?: PlanItem['packages'],
  features: string[] = [],
): PlanItem => ({
  id: `${slug}-plan`,
  slug,
  name: slug,
  price: 0,
  originalPrice: null,
  discountText: null,
  badge: null,
  features,
  color: '#15304D',
  packages,
});

describe('tierOptions', () => {
  // The owner's prices (Figma 10180:55265): what the backend sells is shown
  it('shows the packages the backend sells, in its order', () => {
    const options = tierOptions(BASIC_TIER, [
      plan('regular', [
        { id: 'k1', adsCount: 1, price: 2 },
        { id: 'k3', adsCount: 3, price: 6 },
      ]),
    ]);

    expect(options).toEqual([
      { id: 'basic-1', slug: 'regular', adsCount: 1, label: 'باقة 1 اعلان', price: '2 د.ك' },
      { id: 'basic-3', slug: 'regular', adsCount: 3, label: 'باقة 3 اعلانات', price: '6 د.ك' },
    ]);
  });

  it('never offers a count the backend no longer sells', () => {
    const options = tierOptions(GOLD_TIER, [
      plan('gold', [{ id: 'k', adsCount: 1, price: 7 }]),
    ]);
    expect(options.map((o) => o.adsCount)).toEqual([1]);
  });

  it('falls back to the built-in options (the new prices) while loading or with none', () => {
    expect(tierOptions(GOLD_TIER, [])).toBe(GOLD_TIER.options);
    expect(tierOptions(GOLD_TIER, [plan('gold', [])])).toBe(GOLD_TIER.options);
    expect(GOLD_TIER.options.map((o) => [o.adsCount, o.price])).toEqual([
      [1, '7 د.ك'],
      [3, '17.5 د.ك'],
    ]);
    expect(BASIC_TIER.options.map((o) => [o.adsCount, o.price])).toEqual([
      [1, '2 د.ك'],
      [3, '6 د.ك'],
    ]);
  });
});

describe('packageLabel', () => {
  it.each([
    [1, 'باقة 1 اعلان'],
    [2, 'باقة 2 اعلان'],
    [3, 'باقة 3 اعلانات'],
    [10, 'باقة 10 اعلانات'],
    [11, 'باقة 11 اعلان'],
  ])('%i → %s', (count, label) => {
    expect(packageLabel(count)).toBe(label);
  });
});

describe('tierFeatures', () => {
  it("uses the backend's lines (admin-editable), else the tier's", () => {
    expect(tierFeatures(GOLD_TIER, [plan('gold', [], ['سطر'])])).toEqual(['سطر']);
    expect(tierFeatures(GOLD_TIER, [])).toBe(GOLD_TIER.features);
  });
});
