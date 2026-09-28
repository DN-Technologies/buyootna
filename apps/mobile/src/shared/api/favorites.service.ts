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

export type ProviderType = 'COMPANY' | 'OFFICE';
// A favorites tab: saved ads, companies or offices
export type FavoriteTabType = 'properties' | ProviderType;

// Same card shapes GET /users/companies and /users/offices return
export interface FavoriteCompany {
  id: string;
  userId: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  projectsCount: string;
  serviceArea?: string[];
  logoUrl?: string | null;
  isVerified: boolean;
  lastActivityAt: string;
}

export interface FavoriteOffice {
  id: string;
  userId: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  logoUrl?: string | null;
  isVerified: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  isFavorite: boolean;
}

export interface ProviderFavoritesResponse<T> {
  data: T[];
  meta: FavoritesResponse['meta'];
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

  // Save / unsave a company or office (its identity id)
  toggleProvider: async (
    providerId: string,
  ): Promise<{ favorited: boolean; message: string }> => {
    const response = await apiClient.post<{
      favorited: boolean;
      message: string;
    }>(`/favorites/providers/${providerId}`);
    return response.data;
  },

  getProviderFavoriteIds: async (): Promise<{ ids: string[] }> => {
    const response = await apiClient.get<{ ids: string[] }>(
      '/favorites/providers/ids',
    );
    return response.data;
  },

  getProviderFavorites: async <T extends FavoriteCompany | FavoriteOffice>(
    type: ProviderType,
    page = 1,
    limit = 10,
  ): Promise<ProviderFavoritesResponse<T>> => {
    const response = await apiClient.get<ProviderFavoritesResponse<T>>(
      '/favorites/providers',
      { params: { type, page, limit } },
    );
    return response.data;
  },

  // Clears one tab; returns the removed ids so undo can restore them
  clearAll: async (type: FavoriteTabType): Promise<{ ids: string[] }> => {
    const response = await apiClient.delete<{ ids: string[] }>(
      '/favorites/all',
      { params: { type } },
    );
    return response.data;
  },

  restore: async (
    type: FavoriteTabType,
    ids: string[],
  ): Promise<{ ids: string[] }> => {
    const response = await apiClient.post<{ ids: string[] }>(
      '/favorites/restore',
      { type, ids },
    );
    return response.data;
  },
};
