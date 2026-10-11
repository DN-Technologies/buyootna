import type { PublishOption } from '@/shared/api/plans.service';

import {
  getRepublishCredits,
  getRepublishCreditsFromOptions,
  planTypeToSpend,
} from '../republishCredits';

const option = (overrides: Partial<PublishOption>): PublishOption => ({
  type: 'PLAN_SLOT',
  slotId: 'slot',
  title: '',
  subtitle: '',
  planName: '',
  color: '#15304D',
  adsRemaining: 1,
  durationDays: 30,
  maxImagesPerAd: 10,
  featuredDays: 0,
  prioritySearch: false,
  ...overrides,
});

describe('getRepublishCreditsFromOptions (real wallet)', () => {
  const free = option({
    type: 'FREE_QUOTA',
    slotId: 'FREE_QUOTA',
    adsRemaining: 1,
    durationDays: 10,
  });
  const gold = option({ slotId: 'slot-gold', adsRemaining: 1, featuredDays: 7 });
  const normal = option({ slotId: 'slot-normal', adsRemaining: 2 });

  it('splits featuring plan slots from free/regular credit and names the slots to spend', () => {
    expect(getRepublishCreditsFromOptions([normal, gold, free])).toEqual({
      featuredCount: 1,
      regularCount: 3,
      mode: 'multi',
      featuredSlotId: 'slot-gold',
      // The free welcome ad is spent before paid regular credit
      regularSlotId: 'FREE_QUOTA',
      featuredDays: 30,
      regularDays: 10,
    });
  });

  it('shows simple mode with only regular credit, zero-credit with none', () => {
    expect(getRepublishCreditsFromOptions([free]).mode).toBe('simple');
    expect(getRepublishCreditsFromOptions([]).mode).toBe('zero-credit');
    expect(
      getRepublishCreditsFromOptions([option({ adsRemaining: 0, featuredDays: 7 })])
        .mode,
    ).toBe('zero-credit');
  });

  it('spends the only kind available in simple mode, even when it is featured', () => {
    const credits = getRepublishCreditsFromOptions([gold]);
    expect(credits.mode).toBe('simple');
    expect(planTypeToSpend(credits, 'REGULAR')).toBe('FEATURED');
    expect(credits.featuredSlotId).toBe('slot-gold');
  });
});


describe('getRepublishCredits', () => {
  it('counts gold + silver as featured and free + normal as regular', () => {
    expect(
      getRepublishCredits(1, {
        goldRemaining: 2,
        silverRemaining: 1,
        normalRemaining: 3,
      }),
    ).toEqual({ featuredCount: 3, regularCount: 4, mode: 'multi' });
  });

  it('is zero-credit with nothing left', () => {
    expect(getRepublishCredits(0).mode).toBe('zero-credit');
    expect(
      getRepublishCredits(0, {
        goldRemaining: 0,
        silverRemaining: 0,
        normalRemaining: 0,
      }).mode,
    ).toBe('zero-credit');
  });

  it('is simple with only one kind of credit', () => {
    expect(getRepublishCredits(2).mode).toBe('simple');
    expect(
      getRepublishCredits(0, {
        goldRemaining: 1,
        silverRemaining: 0,
        normalRemaining: 0,
      }).mode,
    ).toBe('simple');
  });

  it('lets an explicit mode win', () => {
    expect(getRepublishCredits(0, undefined, 'multi').mode).toBe('multi');
  });
});
