import type { PropertyDetailsDto } from '@/types/property';

import { sortByRating, sortFavoriteProperties } from '../favoritesSort';

const ad = (id: string, price: number, createdAt: string) =>
  ({ id, price, createdAt }) as PropertyDetailsDto;

const ads = [
  ad('a', 300, '2026-09-02T00:00:00Z'),
  ad('b', 100, '2026-09-03T00:00:00Z'),
  ad('c', 200, '2026-09-01T00:00:00Z'),
];
const ids = (list: { id: string }[]) => list.map((i) => i.id);

describe('favorites sorting', () => {
  it.each([
    ['all', ['a', 'b', 'c']],
    ['newest', ['b', 'a', 'c']],
    ['oldest', ['c', 'a', 'b']],
    ['price_desc', ['a', 'c', 'b']],
    ['price_asc', ['b', 'c', 'a']],
  ] as const)('orders ads by %s without touching the input', (sort, expected) => {
    expect(ids(sortFavoriteProperties(ads, sort))).toEqual(expected);
    expect(ids(ads)).toEqual(['a', 'b', 'c']);
  });

  it('orders companies/offices by rating', () => {
    const list = [
      { id: 'x', rating: 3.5 },
      { id: 'y', rating: 4.2 },
      { id: 'z' },
    ];
    expect(ids(sortByRating(list, 'rating_desc'))).toEqual(['y', 'x', 'z']);
    expect(ids(sortByRating(list, 'rating_asc'))).toEqual(['z', 'x', 'y']);
    expect(ids(sortByRating(list, 'all'))).toEqual(['x', 'y', 'z']);
  });
});
