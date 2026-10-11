import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { favoritesService } from '@/shared/api/favorites.service';
import { queryClient as sharedQueryClient } from '@/shared/api/queryClient';
import { registerIdentityScopedStore } from '@/shared/store/identityScopedStores';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import {
  PROVIDER_FAVORITE_IDS_QUERY_KEY,
  PROVIDER_FAVORITES_QUERY_KEY,
} from './providerFavoritesKeys';

export {
  PROVIDER_FAVORITE_IDS_QUERY_KEY,
  PROVIDER_FAVORITES_QUERY_KEY,
} from './providerFavoritesKeys';

/**
 * Saved companies/offices (the heart on their cards), like useFavorites is
 * for ads: flips at once, saves in the background, rolls back on failure.
 */
export function useProviderFavorites() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: favoritedIds = [] } = useQuery({
    queryKey: PROVIDER_FAVORITE_IDS_QUERY_KEY,
    queryFn: async () => (await favoritesService.getProviderFavoriteIds()).ids,
    enabled: !!token,
  });

  const toggleMutation = useMutation({
    mutationFn: (providerId: string) =>
      favoritesService.toggleProvider(providerId),
    onMutate: async (providerId: string) => {
      await queryClient.cancelQueries({
        queryKey: PROVIDER_FAVORITE_IDS_QUERY_KEY,
      });
      const previousIds =
        queryClient.getQueryData<string[]>(PROVIDER_FAVORITE_IDS_QUERY_KEY) ??
        [];
      queryClient.setQueryData(
        PROVIDER_FAVORITE_IDS_QUERY_KEY,
        previousIds.includes(providerId)
          ? previousIds.filter((id) => id !== providerId)
          : [...previousIds, providerId],
      );
      return { previousIds };
    },
    onSuccess: (result, providerId) => {
      queryClient.setQueryData<string[]>(
        PROVIDER_FAVORITE_IDS_QUERY_KEY,
        (prev = []) =>
          result.favorited
            ? [...prev.filter((id) => id !== providerId), providerId]
            : prev.filter((id) => id !== providerId),
      );
      queryClient.invalidateQueries({ queryKey: PROVIDER_FAVORITES_QUERY_KEY });
    },
    onError: (error, _providerId, context) => {
      if (context) {
        queryClient.setQueryData(
          PROVIDER_FAVORITE_IDS_QUERY_KEY,
          context.previousIds,
        );
      }
      showAlert('خطأ', getApiErrorMessage(error, 'تعذر تحديث المفضلة'));
    },
  });

  const isFavorited = (providerId: string) =>
    favoritedIds.includes(providerId);

  const toggleFavorite = async (providerId: string) => {
    if (!token) {
      showAlert('تنبيه', 'يجب تسجيل الدخول لإضافة الشركات والمكاتب إلى المفضلة');
      return;
    }
    await toggleMutation.mutateAsync(providerId).catch(() => undefined);
  };

  return { favoritedIds, isFavorited, toggleFavorite };
}

// Cleared on logout / identity switch, like the ad favorites
registerIdentityScopedStore(() => {
  sharedQueryClient.setQueryData(PROVIDER_FAVORITE_IDS_QUERY_KEY, []);
  sharedQueryClient.removeQueries({ queryKey: PROVIDER_FAVORITES_QUERY_KEY });
});
