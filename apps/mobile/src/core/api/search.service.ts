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

// Recursively strip empty strings and null values so class-transformer
// doesn't coerce '' to 0 on the backend.
function stripEmptyValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null
    ) {
      const nested = stripEmptyValues(value);
      if (Object.keys(nested).length > 0) cleaned[key] = nested;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
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

  advancedSearch: async (payload: {
    tab: string;
    filters: any;
    page?: number;
  }): Promise<PaginatedResponse<SearchResultItem>> => {
    // Strip empty strings and nulls before sending
    const cleanedFilters = stripEmptyValues(payload.filters);

    // Send the POST request with the active tab and its deeply nested filter state
    const response = await apiClient.post<
      PaginatedResponse<SearchResultItem>
    >('/search/advanced', {
      tab: payload.tab,
      filters: cleanedFilters,
      page: payload.page || 1,
      limit: 10,
    });

    return response.data; // { data: SearchResultItem[], meta: PaginationMeta }
  },
};
