import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

import {
  compactCount,
  dealCounts,
  governorateAds,
  governorateSummaries,
  markDoneLabel,
  splitByTab,
  visibleAds,
} from '../officeProperties';

const ad = (over: Partial<ActivityItem> = {}): ActivityItem => ({
  id: over.id ?? 'a',
  images: [],
  price: 100,
  type: 'بيع',
  category: 'APARTMENT',
  status: 'ACTIVE',
  updatedAt: '2026-05-01T00:00:00.000Z',
  publishedAt: '2026-05-01T00:00:00.000Z',
  governorateId: 'capital',
  listingType: 'SALE',
  ...over,
});

describe('office properties model', () => {
  it('splits ads, drafts and the archive (expired + done)', () => {
    const tabs = splitByTab([
      ad({ id: '1' }),
      ad({ id: '2', status: 'DRAFT' }),
      ad({ id: '3', status: 'EXPIRED' }),
      ad({ id: '4', status: 'CLOSED' }),
      ad({ id: '5', status: 'REJECTED' }),
    ]);
    expect(tabs.ads.map((a) => a.id)).toEqual(['1']);
    expect(tabs.drafts.map((a) => a.id)).toEqual(['2']);
    expect(tabs.archived.map((a) => a.id)).toEqual(['3', '4']);
  });

  it('a card for every governorate, counting ads, featured and categories', () => {
    const summaries = governorateSummaries([
      ad({ id: '1', isPremium: true }),
      ad({ id: '2', category: 'HOUSE' }),
      ad({ id: '3', governorateId: 'hawally' }),
    ]);
    expect(summaries.map((s) => s.governorateId)).toEqual([
      'capital',
      'hawally',
      'ahmadi',
      'jahra',
      'farwaniya',
      'mubarak_alkabeer',
    ]);
    expect(summaries[0]).toMatchObject({
      title: 'محافظة العاصمة',
      count: 2,
      featuredCount: 1,
    });
    expect(summaries[0].categories).toHaveLength(2);
    expect(summaries[2]).toMatchObject({ count: 0, featuredCount: 0, categories: [] });
  });

  it('adds «مناطق أخرى» only when an ad has no governorate', () => {
    expect(governorateSummaries([ad()]).map((s) => s.governorateId)).not.toContain('other');
    const withOther = governorateSummaries([ad({ governorateId: null })]);
    expect(withOther[withOther.length - 1]).toMatchObject({
      governorateId: 'other',
      count: 1,
    });
  });

  it('narrows a governorate by area, and counts each deal', () => {
    const ads = [
      ad({ id: '1', areaId: 'capital_1' }),
      ad({ id: '2', areaId: 'capital_2', listingType: 'RENT' }),
      ad({ id: '3', governorateId: 'hawally' }),
    ];
    expect(governorateAds(ads, 'capital', null).map((a) => a.id)).toEqual(['1', '2']);
    expect(governorateAds(ads, 'capital', 'capital_2').map((a) => a.id)).toEqual(['2']);
    expect(dealCounts(governorateAds(ads, 'capital', null))).toEqual({
      SALE: 1,
      RENT: 1,
      EXCHANGE: 0,
    });
  });

  describe('a deal tab, filtered and sorted', () => {
    const ads = [
      ad({ id: 'old', price: 300, publishedAt: '2026-01-01T00:00:00.000Z' }),
      ad({ id: 'featured', price: 200, isPremium: true, publishedAt: '2026-02-01T00:00:00.000Z' }),
      ad({ id: 'hidden', price: 100, isHidden: true, publishedAt: '2026-03-01T00:00:00.000Z' }),
      ad({ id: 'rent', listingType: 'RENT' }),
    ];
    const ids = (list: ActivityItem[]) => list.map((a) => a.id);

    it.each([
      ['ALL', ['featured', 'hidden', 'old']],
      ['ACTIVE', ['featured', 'old']],
      ['FEATURED', ['featured']],
      ['HIDDEN', ['hidden']],
    ] as const)('filter %s', (filter, expected) => {
      expect(ids(visibleAds(ads, 'SALE', filter, 'ALL'))).toEqual(expected);
    });

    it.each([
      ['NEWEST', ['hidden', 'featured', 'old']],
      ['OLDEST', ['old', 'featured', 'hidden']],
      ['PRICE_ASC', ['hidden', 'featured', 'old']],
      ['PRICE_DESC', ['old', 'featured', 'hidden']],
    ] as const)('sort %s', (sort, expected) => {
      expect(ids(visibleAds(ads, 'SALE', 'ALL', sort))).toEqual(expected);
    });
  });

  it('names «تم البيع» after the deal', () => {
    expect(markDoneLabel({ listingType: 'SALE' })).toBe('تم البيع');
    expect(markDoneLabel({ listingType: 'RENT' })).toBe('تم التأجير');
    expect(markDoneLabel({ listingType: 'EXCHANGE' })).toBe('تمت المبادلة');
  });

  it('shortens the views tile like Figma («1.4K»)', () => {
    expect(compactCount(712)).toBe('712');
    expect(compactCount(1400)).toBe('1.4K');
    expect(compactCount(1450)).toBe('1.4K');
    expect(compactCount(23_900)).toBe('23K');
  });
});
