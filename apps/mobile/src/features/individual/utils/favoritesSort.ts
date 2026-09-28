import type { FavoritesSortOption } from '@/features/individual/components/favorites/FavoritesSortSheet';
import type { PropertyDetailsDto } from '@/types/property';

const time = (iso: string) => new Date(iso).getTime();

/** Orders favorited ads by the chosen option; 'all' keeps the API order. */
export function sortFavoriteProperties(
  list: PropertyDetailsDto[],
  sort: FavoritesSortOption,
): PropertyDetailsDto[] {
  const copy = [...list];
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => time(a.createdAt) - time(b.createdAt));
    case 'newest':
      return copy.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    default:
      return copy;
  }
}

/** Orders companies/offices by rating; other options keep their order. */
export function sortByRating<T extends { rating?: number }>(
  list: T[],
  sort: FavoritesSortOption,
): T[] {
  const copy = [...list];
  if (sort === 'rating_desc') {
    return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  if (sort === 'rating_asc') {
    return copy.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
  }
  return copy;
}
