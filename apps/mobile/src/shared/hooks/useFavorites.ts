import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { favoritesService } from '@/shared/api/favorites.service';
import { queryClient as sharedQueryClient } from '@/shared/api/queryClient';
import { registerIdentityScopedStore } from '@/shared/store/identityScopedStores';
import { useAuthStore } from '@/shared/store/useAuthStore';

export const FAVORITE_IDS_QUERY_KEY = ['favoriteIds'];

export function useFavorites() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: favoritedIds = [], isLoading } = useQuery({
    queryKey: FAVORITE_IDS_QUERY_KEY,
    queryFn: async () => (await favoritesService.getFavoriteIds()).ids,
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: (propertyId: string) =>
      favoritesService.toggleFavorite(propertyId),
    onMutate: async (propertyId: string) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_QUERY_KEY });
      const previousIds =
        queryClient.getQueryData<string[]>(FAVORITE_IDS_QUERY_KEY) ?? [];
      const isAlreadyFavorited = previousIds.includes(propertyId);
      const updatedIds = isAlreadyFavorited
        ? previousIds.filter((id) => id !== propertyId)
        : [...previousIds, propertyId];
      queryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, updatedIds);
      return { previousIds };
    },
    onSuccess: (result, propertyId) => {
      // Sync with actual result from backend
      queryClient.setQueryData<string[]>(
        FAVORITE_IDS_QUERY_KEY,
        (prev = []) =>
          result.favorited
            ? [...prev.filter((id) => id !== propertyId), propertyId]
            : prev.filter((id) => id !== propertyId),
      );
    },
    onError: (error, _propertyId, context) => {
      console.error('Failed to toggle favorite:', error);
      // Rollback optimistic update
      if (context) {
        queryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, context.previousIds);
      }
    },
  });

  const isFavorited = (propertyId: string) => favoritedIds.includes(propertyId);

  const toggleFavorite = async (propertyId: string) => {
    if (!token) return;
    await toggleMutation.mutateAsync(propertyId);
  };

  return { favoritedIds, isLoading, isFavorited, toggleFavorite };
}

// Clears the cached favorite IDs on logout / identity switch, mirroring the
// old Zustand store's `clear()` action.
registerIdentityScopedStore(() =>
  sharedQueryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, []),
);
