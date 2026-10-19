import {
  EMPTY_REQUEST_FILTERS,
  requestFilterCount,
  toRequestListFilters,
} from '../RequestFilterSheet';

const item = (label: string) => ({ id: label, label });

describe('toRequestListFilters', () => {
  it('nothing picked: no filters', () => {
    expect(toRequestListFilters(EMPTY_REQUEST_FILTERS)).toEqual({});
    expect(requestFilterCount(EMPTY_REQUEST_FILTERS)).toBe(0);
  });

  it('sends the picks, with prices as numbers (Arabic digits too)', () => {
    expect(
      toRequestListFilters({
        ...EMPTY_REQUEST_FILTERS,
        specialty: item('التشطيب'),
        type: item('تشطيب شقة'),
        priceFrom: '١٬٠٠٠',
        priceTo: '5000',
      }),
    ).toEqual({
      specialty: 'التشطيب',
      type: 'تشطيب شقة',
      priceFrom: 1000,
      priceTo: 5000,
    });
  });

  it('العنوان: the area when picked, else the governorate', () => {
    const gov = { id: 'hawalli', label: 'حولي' };
    expect(
      toRequestListFilters({ ...EMPTY_REQUEST_FILTERS, gov }).location,
    ).toBe('حولي');
    expect(
      toRequestListFilters({
        ...EMPTY_REQUEST_FILTERS,
        gov,
        area: { id: 'hawalli_1', label: 'السالمية' },
      }).location,
    ).toBe('السالمية');
  });

  it('an empty or non-numeric price is left out', () => {
    expect(
      toRequestListFilters({ ...EMPTY_REQUEST_FILTERS, priceFrom: 'abc' }),
    ).toEqual({});
  });
});
