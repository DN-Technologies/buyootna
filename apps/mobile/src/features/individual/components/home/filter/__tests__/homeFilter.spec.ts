import {
  EMPTY_HOME_FILTERS,
  hasHomeFilters,
  toOfficeLocation,
  toPropertyFilterParams,
} from '../homeFilter';

const f = (patch: Partial<typeof EMPTY_HOME_FILTERS>) => ({
  ...EMPTY_HOME_FILTERS,
  ...patch,
});

describe('home filter', () => {
  it('nothing set: nothing to apply on any tab', () => {
    for (const tab of ['sale', 'rent', 'exchange', 'offices'] as const) {
      expect(hasHomeFilters(tab, EMPTY_HOME_FILTERS)).toBe(false);
    }
  });

  it('only counts the fields the tab shows', () => {
    const swapOnly = f({ requestYear: '2019', exchangeCategory: 'LAND' });
    expect(hasHomeFilters('exchange', swapOnly)).toBe(true);
    expect(hasHomeFilters('sale', swapOnly)).toBe(false);
    expect(hasHomeFilters('offices', f({ maxPrice: '1000' }))).toBe(false);
    expect(hasHomeFilters('offices', f({ governorateId: 'hawally' }))).toBe(true);
  });

  it('بيع / ايجار: location, categories and the most it may cost', () => {
    expect(
      toPropertyFilterParams(
        'sale',
        f({
          governorateId: 'hawally',
          areaId: 'salmiya',
          categories: ['APARTMENT', 'HOUSE'],
          maxPrice: '200,000',
          requestYear: '2019',
        }),
      ),
    ).toEqual({
      governorateId: 'hawally',
      areaId: 'salmiya',
      category: 'APARTMENT,HOUSE',
      maxPrice: '200000',
    });
  });

  it('بدل: الحالة as its category, and both years', () => {
    expect(
      toPropertyFilterParams(
        'exchange',
        f({
          exchangeCategory: 'HOUSE',
          requestYear: '2019',
          requiredYear: '2023',
          categories: ['APARTMENT'],
        }),
      ),
    ).toEqual({ category: 'HOUSE', requestYear: '2019', requiredYear: '2023' });
  });

  it("مكاتب: the area's name, else the governorate's", () => {
    expect(toOfficeLocation(f({ governorateId: 'hawally' }))).toBe('حولي');
    expect(toOfficeLocation(EMPTY_HOME_FILTERS)).toBeUndefined();
  });
});
