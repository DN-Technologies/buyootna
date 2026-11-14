import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { HomeSort } from '@/features/individual/components/home/homeSort';
import { feedService } from '@/features/individual/services/feed.service';
import type { PropertyDto } from '@/types/feed';

export type MarketTab = 'sale' | 'rent' | 'exchange';

const API_TYPE: Record<MarketTab, 'SALE' | 'RENT' | 'EXCHANGE'> = {
  sale: 'SALE',
  rent: 'RENT',
  exchange: 'EXCHANGE',
};

const PAGE_SIZE = 10;

/**
 * عقارات السوق: one deal type's ads, page by page, with the tab's filters
 * and order. The office's own ads are left out, as on its home's row.
 */
export function useOfficeMarket(
  tab: MarketTab,
  sort: HomeSort,
  filterParams: Record<string, string> | undefined,
  ownIdentityId: string | undefined,
) {
  const query = useInfiniteQuery({
    queryKey: ['officeMarket', tab, sort, filterParams],
    queryFn: ({ pageParam }) =>
      feedService.getProperties(
        API_TYPE[tab],
        pageParam,
        PAGE_SIZE,
        sort,
        filterParams,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
  });

  const properties = useMemo(() => {
    const seen = new Set<string>();
    const out: PropertyDto[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const item of page.data) {
        if (seen.has(item.id) || item.identityId === ownIdentityId) continue;
        seen.add(item.id);
        out.push(item);
      }
    }
    return out;
  }, [query.data, ownIdentityId]);

  return {
    properties,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
