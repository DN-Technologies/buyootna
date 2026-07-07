import { create } from 'zustand';

import { favoritesService } from '@/core/api/favorites.service';

import { useAuthStore } from './useAuthStore';

interface FavoritesState {
  favoritedIds: string[];
  isLoading: boolean;

  // Actions
  loadFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorited: (propertyId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => {
  return {
    favoritedIds: [],
    isLoading: false,

    loadFavorites: async () => {
      const token = useAuthStore.getState().token;
      if (!token) {
        set({ favoritedIds: [] });
        return;
      }

      set({ isLoading: true });
      try {
        const data = await favoritesService.getFavoriteIds();
        set({ favoritedIds: data.ids, isLoading: false });
      } catch (error) {
        console.error('Failed to load favorited IDs:', error);
        set({ isLoading: false });
      }
    },

    toggleFavorite: async (propertyId: string) => {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const currentIds = get().favoritedIds;
      const isAlreadyFavorited = currentIds.includes(propertyId);

      // Optimistic update
      const updatedIds = isAlreadyFavorited
        ? currentIds.filter((id) => id !== propertyId)
        : [...currentIds, propertyId];

      set({ favoritedIds: updatedIds });

      try {
        const result = await favoritesService.toggleFavorite(propertyId);
        // Sync with actual result from backend
        const idsAfterResult = result.favorited
          ? [
              ...get().favoritedIds.filter((id) => id !== propertyId),
              propertyId,
            ]
          : get().favoritedIds.filter((id) => id !== propertyId);
        set({ favoritedIds: idsAfterResult });
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // Rollback optimistic update
        set({ favoritedIds: currentIds });
      }
    },

    isFavorited: (propertyId: string) => {
      return get().favoritedIds.includes(propertyId);
    },

    clear: () => {
      set({ favoritedIds: [] });
    },
  };
});
