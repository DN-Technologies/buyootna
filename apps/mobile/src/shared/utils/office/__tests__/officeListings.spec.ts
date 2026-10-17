import { PropertyDto } from '@/types/feed';

import { groupByGovernorate, officeListingsFor } from '../officeListings';

const ad = (overrides: Partial<PropertyDto>): PropertyDto => ({
  id: 'p',
  images: [],
  price: 1,
  companyName: 'مكتب',
  isFeatured: false,
  type: 'سكني',
  area: 100,
  beds: 1,
  baths: 1,
  location: 'x',
  createdAt: '2026-10-01T00:00:00.000Z',
  listingType: 'SALE',
  ...overrides,
});

describe('office listings by governorate', () => {
  const ads = [
    ad({ id: 'a', governorateId: 'hawally', categoryLabel: 'شقة' }),
    ad({ id: 'b', governorateId: 'capital', categoryLabel: 'بيت', publishedAt: '2026-10-05T00:00:00.000Z' }),
    ad({ id: 'c', governorateId: 'capital', categoryLabel: 'بيت', listingType: 'RENT' }),
    ad({ id: 'd', governorateId: null, categoryLabel: 'أرض' }),
  ];

  it('groups in the governorates order, with ads without one last', () => {
    expect(groupByGovernorate(ads).map((g) => [g.title, g.count])).toEqual([
      ['محافظة العاصمة', 2],
      ['محافظة حولي', 1],
      ['مناطق أخرى', 1],
    ]);
  });

  it('lists each category once and takes the newest ad time', () => {
    const capital = groupByGovernorate(ads)[0];
    expect(capital.categories).toEqual(['بيت']);
    expect(capital.latestAt).toBe('2026-10-05T00:00:00.000Z');
  });

  it("picks one governorate's ads of one deal", () => {
    expect(officeListingsFor(ads, 'capital', 'SALE').map((p) => p.id)).toEqual(['b']);
    expect(officeListingsFor(ads, 'capital', 'RENT').map((p) => p.id)).toEqual(['c']);
    expect(officeListingsFor(ads, 'other', 'SALE').map((p) => p.id)).toEqual(['d']);
  });
});
