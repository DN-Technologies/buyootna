import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  FavoriteCompany,
  FavoriteOffice,
  favoritesService,
  ProviderFavoritesResponse,
  ProviderType,
} from '@/shared/api/favorites.service';
import {
  PROVIDER_FAVORITE_IDS_QUERY_KEY,
  PROVIDER_FAVORITES_QUERY_KEY,
} from '@/shared/hooks/providers/providerFavoritesKeys';
import { useAuthStore } from '@/shared/store/useAuthStore';

type Provider<T extends ProviderType> = T extends 'COMPANY'
  ? FavoriteCompany
  : FavoriteOffice;

/**
 * Saved companies or offices for the Favorites screen, with the same edits
 * as saved ads: remove one / all on the server, and put them back for undo.
 */
export function useFavoriteProviders<T extends ProviderType>(type: T) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryKey = [...PROVIDER_FAVORITES_QUERY_KEY, type];

  type Pages = InfiniteData<ProviderFavoritesResponse<Provider<T>>, number>;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      favoritesService.getProviderFavorites<Provider<T>>(type, pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    enabled: !!token,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  const editPages = (edit: (pages: Pages) => Pages) =>
    queryClient.setQueryData<Pages>(queryKey, (old) => (old ? edit(old) : old));

  const setIds = (update: (ids: string[]) => string[]) =>
    queryClient.setQueryData<string[]>(PROVIDER_FAVORITE_IDS_QUERY_KEY, (prev = []) =>
      update(prev),
    );

  const refresh = async () => {
    setIsRefreshing(true);
    await query.refetch();
    setIsRefreshing(false);
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  /** Unsaves one; returns how to undo it. */
  const remove = async (item: Provider<T>) => {
    editPages((old) => ({
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((p) => p.id !== item.id),
      })),
    }));
    setIds((ids) => ids.filter((id) => id !== item.id));
    await favoritesService.toggleProvider(item.id);

    return async () => {
      await favoritesService.restore(type, [item.id]);
      setIds((ids) => [...ids, item.id]);
      await query.refetch();
    };
  };

  /** Unsaves the whole tab; returns how to undo it. */
  const removeAll = async () => {
    editPages((old) => ({
      ...old,
      pages: old.pages.map((page) => ({ ...page, data: [] })),
    }));
    const { ids } = await favoritesService.clearAll(type);
    setIds((prev) => prev.filter((id) => !ids.includes(id)));

    return async () => {
      await favoritesService.restore(type, ids);
      setIds((prev) => [...new Set([...prev, ...ids])]);
      await query.refetch();
    };
  };

  return {
    items,
    isLoading: query.isLoading,
    isRefreshing,
    refresh,
    loadMore,
    remove,
    removeAll,
  };
}
