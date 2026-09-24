import { Prisma } from '@prisma/client';
import {
  AlertCriteria,
  alertMatchWhere,
  MatchableProperty,
  propertyMatchesAlert,
} from './alert-matching.util';

const alert = (overrides: Partial<AlertCriteria> = {}): AlertCriteria => ({
  type: 'PROPERTIES',
  operationType: 'SALE',
  governorateId: 'hawally',
  areaId: null,
  categoryId: null,
  price: null,
  rentValue: null,
  areaSize: null,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  startDate: null,
  endDate: null,
  ...overrides,
});

const property = (
  overrides: Partial<MatchableProperty> = {},
): MatchableProperty => ({
  type: 'SALE',
  category: 'APARTMENT',
  governorateId: 'hawally',
  areaId: 'hawally_1',
  price: 100000,
  areaSize: 200,
  beds: 3,
  baths: 2,
  floors: 1,
  requestYear: null,
  requiredYear: null,
  startDate: null,
  ...overrides,
});

/**
 * Minimal evaluator for the subset of Prisma where-syntax alertMatchWhere
 * produces (equality, gte/lte, not:null), so every case below also checks
 * that the DB filter agrees with the in-memory predicate.
 */
function evaluateWhere(
  where: Prisma.PropertyWhereInput,
  p: MatchableProperty,
): boolean {
  return Object.entries(where).every(([key, condition]) => {
    const value = (p as unknown as Record<string, unknown>)[key] as
      number | string | Date | null;
    if (condition === null || typeof condition !== 'object') {
      return value === condition;
    }
    const c = condition as { gte?: unknown; lte?: unknown; not?: unknown };
    if ('not' in c && c.not === null && value === null) return false;
    if (value === null || value === undefined) {
      return c.gte === undefined && c.lte === undefined;
    }
    if (c.gte !== undefined && value < (c.gte as typeof value)) return false;
    if (c.lte !== undefined && value > (c.lte as typeof value)) return false;
    return true;
  });
}

const cases: [string, AlertCriteria, MatchableProperty, boolean][] = [
  [
    'a bare sale alert matches any sale in the governorate',
    alert(),
    property(),
    true,
  ],
  [
    'a different governorate never matches',
    alert(),
    property({ governorateId: 'capital' }),
    false,
  ],
  [
    'listing type must equal the operation',
    alert({ operationType: 'RENT' }),
    property(),
    false,
  ],
  [
    'area must match when set',
    alert({ areaId: 'hawally_2' }),
    property(),
    false,
  ],
  ['area matches when equal', alert({ areaId: 'hawally_1' }), property(), true],
  [
    'category id maps to the enum',
    alert({ categoryId: 'apartment' }),
    property(),
    true,
  ],
  [
    'a different category does not match',
    alert({ categoryId: 'villa' }),
    property(),
    false,
  ],
  [
    'sale price is a max budget (under)',
    alert({ price: 150000 }),
    property(),
    true,
  ],
  [
    'sale price is a max budget (over)',
    alert({ price: 50000 }),
    property(),
    false,
  ],
  [
    'sale budget excludes listings without a price',
    alert({ price: 150000 }),
    property({ price: null }),
    false,
  ],
  [
    'rent value caps the rent',
    alert({ operationType: 'RENT', rentValue: 500 }),
    property({ type: 'RENT', price: 450 }),
    true,
  ],
  [
    'rent above the cap does not match',
    alert({ operationType: 'RENT', rentValue: 400 }),
    property({ type: 'RENT', price: 450 }),
    false,
  ],
  ['area size is a minimum', alert({ areaSize: 150 }), property(), true],
  ['smaller area does not match', alert({ areaSize: 250 }), property(), false],
  ['0 means any', alert({ price: 0, areaSize: 0 }), property(), true],
  [
    'exchange minimum rooms met',
    alert({ operationType: 'EXCHANGE', rooms: 3, baths: 2 }),
    property({ type: 'EXCHANGE' }),
    true,
  ],
  [
    'exchange too few rooms',
    alert({ operationType: 'EXCHANGE', rooms: 4 }),
    property({ type: 'EXCHANGE' }),
    false,
  ],
  [
    'exchange years must be equal',
    alert({ operationType: 'EXCHANGE', requestYear: 2026 }),
    property({ type: 'EXCHANGE', requestYear: 2026 }),
    true,
  ],
  [
    'exchange year mismatch',
    alert({ operationType: 'EXCHANGE', requiredYear: 2027 }),
    property({ type: 'EXCHANGE', requiredYear: 2028 }),
    false,
  ],
  ['rooms are ignored outside exchange', alert({ rooms: 9 }), property(), true],
  [
    'auction alerts match auction listings',
    alert({ type: 'AUCTIONS', operationType: null }),
    property({ type: 'AUCTION' }),
    true,
  ],
  [
    'auction alerts ignore other listing types',
    alert({ type: 'AUCTIONS', operationType: null }),
    property(),
    false,
  ],
  [
    'auction starts inside the window',
    alert({
      type: 'AUCTIONS',
      operationType: null,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-15'),
    }),
    property({ type: 'AUCTION', startDate: new Date('2026-10-05') }),
    true,
  ],
  [
    'auction starts after the window',
    alert({
      type: 'AUCTIONS',
      operationType: null,
      endDate: new Date('2026-10-15'),
    }),
    property({ type: 'AUCTION', startDate: new Date('2026-10-20') }),
    false,
  ],
  [
    'a dated window excludes auctions without a start date',
    alert({
      type: 'AUCTIONS',
      operationType: null,
      startDate: new Date('2026-10-01'),
    }),
    property({ type: 'AUCTION', startDate: null }),
    false,
  ],
];

describe('alert matching', () => {
  it.each(cases)('%s', (_name, a, p, expected) => {
    expect(propertyMatchesAlert(a, p)).toBe(expected);
    expect(evaluateWhere(alertMatchWhere(a), p)).toBe(expected);
  });

  it('builds the expected where for a full rent alert', () => {
    expect(
      alertMatchWhere(
        alert({
          operationType: 'RENT',
          areaId: 'hawally_1',
          categoryId: 'apartment',
          rentValue: 500,
          areaSize: 100,
        }),
      ),
    ).toEqual({
      governorateId: 'hawally',
      type: 'RENT',
      areaId: 'hawally_1',
      category: 'APARTMENT',
      price: { lte: 500 },
      areaSize: { gte: 100 },
    });
  });
});
