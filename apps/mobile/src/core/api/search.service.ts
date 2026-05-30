import apiClient from '@/core/api/api';

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'rating';

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
}

// Map to backend unified response format
export interface SearchResultItem {
  id: string;
  name: string;
  category: string;
  serviceArea: string;
  projectsCount: string;
  logoUrl: string;
  isFavorite?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    current: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const searchService = {
  globalSearch: async (
    params: SearchParams,
  ): Promise<PaginatedResponse<SearchResultItem>> => {
    // Axios will automatically stringify the params object into query parameters
    const response = await apiClient.get<PaginatedResponse<SearchResultItem>>(
      '/search',
      {
        params,
      },
    );
    return response.data;
  },
};
