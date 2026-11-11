import { isBundlePlan, officeOptionLabel, officeOptions } from '../officePlans';
import { groupWalletSlots, walletExpiryText } from '../planWallet';

describe('office plans', () => {
  it('names a package «1 اعلان عادي» or «1 اعلان مميز»', () => {
    expect(officeOptionLabel({ id: 'a', adsCount: 1, featuredAdsCount: 0, price: 2 })).toBe(
      '1 اعلان عادي',
    );
    expect(officeOptionLabel({ id: 'b', adsCount: 0, featuredAdsCount: 1, price: 3 })).toBe(
      '1 اعلان مميز',
    );
  });

  it('marks the featured choice (drawn in orange) and buys by id', () => {
    const options = officeOptions({
      slug: 'office-basic',
      packages: [
        { id: 'a', adsCount: 1, featuredAdsCount: 0, price: 2 },
        { id: 'b', adsCount: 0, featuredAdsCount: 1, price: 3 },
      ],
    } as never);
    expect(options.map((o) => [o.packageId, o.featured, o.price])).toEqual([
      ['a', false, '2 د.ك'],
      ['b', true, '3 د.ك'],
    ]);
  });

  it('a plan with one package is a bundle', () => {
    expect(isBundlePlan({ packages: [{}] } as never)).toBe(true);
    expect(isBundlePlan({ packages: [{}, {}] } as never)).toBe(false);
  });
});

describe('wallet validity', () => {
  it('keeps the soonest end date of a tier and flags featured credits', () => {
    const slot = (over: object) => ({
      id: 'x',
      planId: 'p',
      planName: 'اعلان مميز',
      planSlug: 'office-featured',
      adsRemaining: 1,
      maxActiveAds: 1,
      totalAds: 1,
      featured: true,
      createdAt: '2026-11-01',
      ...over,
    });
    const [tier] = groupWalletSlots([
      slot({ expiresAt: '2027-05-11T10:00:00.000Z' }),
      slot({ expiresAt: '2027-01-11T10:00:00.000Z' }),
    ]);
    expect(tier).toMatchObject({ featured: true, adsRemaining: 2, expiresAt: '2027-01-11T10:00:00.000Z' });
    expect(walletExpiryText(tier.expiresAt!)).toMatch(/^تنتهي في /);
  });
});
