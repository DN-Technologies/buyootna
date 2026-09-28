import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  FavoritesResponse,
  favoritesService,
} from '@/shared/api/favorites.service';
import {
  FAVORITE_IDS_QUERY_KEY,
  useFavorites,
} from '@/shared/hooks/useFavorites';
import type { PropertyDetailsDto } from '@/types/property';

export const FAVORITES_QUERY_KEY = ['favorites'];

type FavoritesPages = InfiniteData<FavoritesResponse, number>;

/**
 * The favorited ads (paginated) and the list edits the screen makes:
 * remove one / all (on the server too), and put them back for undo.
 */
export function useFavoriteProperties() {
  const queryClient = useQueryClient();
  const { toggleFavorite } = useFavorites();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useInfiniteQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: ({ pageParam }) => favoritesService.getFavorites(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const properties = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  const editPages = (edit: (pages: FavoritesPages) => FavoritesPages) =>
    queryClient.setQueryData<FavoritesPages>(FAVORITES_QUERY_KEY, (old) =>
      old ? edit(old) : old,
    );

  // Pull to refresh starts over from page 1
  const refresh = async () => {
    setIsRefreshing(true);
    editPages((old) => ({
      pages: old.pages.slice(0, 1),
      pageParams: old.pageParams.slice(0, 1),
    }));
    await query.refetch();
    setIsRefreshing(false);
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  const setFirstPage = (update: (data: PropertyDetailsDto[]) => PropertyDetailsDto[]) =>
    editPages((old) => ({
      ...old,
      pages: old.pages.map((page, idx) =>
        idx === 0 ? { ...page, data: update(page.data) } : page,
      ),
    }));

  /** Removes one ad from favorites; returns how to undo it. */
  const remove = async (item: PropertyDetailsDto) => {
    editPages((old) => ({
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((p) => p.id !== item.id),
      })),
    }));
    await toggleFavorite(item.id);

    return async () => {
      setFirstPage((data) => [item, ...data]);
      await toggleFavorite(item.id);
    };
  };

  /** Removes every saved ad (on the server in one call); returns how to undo it. */
  const removeAll = async () => {
    const removed = [...properties];
    editPages((old) => ({
      ...old,
      pages: old.pages.map((page) => ({ ...page, data: [] })),
    }));
    const { ids } = await favoritesService.clearAll('properties');
    queryClient.setQueryData<string[]>(FAVORITE_IDS_QUERY_KEY, (prev = []) =>
      prev.filter((id) => !ids.includes(id)),
    );

    return async () => {
      await favoritesService.restore('properties', ids);
      setFirstPage(() => removed);
      queryClient.setQueryData<string[]>(FAVORITE_IDS_QUERY_KEY, (prev = []) => [
        ...new Set([...prev, ...ids]),
      ]);
    };
  };

  return {
    properties,
    isLoading: query.isLoading,
    isRefreshing,
    refresh,
    loadMore,
    remove,
    removeAll,
  };
}
