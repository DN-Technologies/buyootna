import apiClient from '@/shared/api/api';
import { PropertyDetailsDto } from '@/types/property';

export interface FavoritesResponse {
  data: PropertyDetailsDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export const favoritesService = {
  // Toggle favorite status for a property
  toggleFavorite: async (propertyId: string): Promise<{ favorited: boolean; message: string }> => {
    const response = await apiClient.post<{ favorited: boolean; message: string }>(
      `/favorites/${propertyId}`,
    );
    return response.data;
  },

  // Get paginated list of favorited properties
  getFavorites: async (page = 1, limit = 10): Promise<FavoritesResponse> => {
    const response = await apiClient.get<FavoritesResponse>('/favorites', {
      params: { page, limit },
    });
    return response.data;
  },

  // Check if a single property is favorited
  checkFavorite: async (propertyId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.get<{ isFavorited: boolean }>(
      `/favorites/check/${propertyId}`,
    );
    return response.data;
  },

  // Get all favorited property IDs (for bulk feeds)
  getFavoriteIds: async (): Promise<{ ids: string[] }> => {
    const response = await apiClient.get<{ ids: string[] }>('/favorites/ids');
    return response.data;
  },
};
