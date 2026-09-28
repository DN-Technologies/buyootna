import type { HomeSort } from '@/features/individual/components/home/homeSort';
import apiClient from '@/shared/api/api';
import {
  CompaniesResponse,
  HomeFeedResponse,
  OfficesResponse,
  PropertiesResponse,
} from '@/types/feed';

export const feedService = {
  /**
   * Fetches the grouped home feed (Sale, Rent, Exchange, and Companies)
   * This endpoint is public and does not require a JWT token.
   */
  getHomeFeed: async (): Promise<HomeFeedResponse> => {
    // We expect the backend to return the data exactly matching HomeFeedResponse
    const response = await apiClient.get<HomeFeedResponse>(
      '/properties/feed/home',
    );
    return response.data;
  },

  /**
   * Fetches a paginated list of properties based on the provided filters.
   * This endpoint is public and does not require a JWT token.
   */
  getProperties: async (
    type?: 'SALE' | 'RENT' | 'EXCHANGE',
    page: number = 1,
    limit: number = 10,
    sort: HomeSort = 'DEFAULT',
  ): Promise<PropertiesResponse> => {
    const response = await apiClient.get<PropertiesResponse>('/properties', {
      params: {
        page,
        limit,
        ...(type ? { type } : {}),
        // The default order needs no param (and older APIs don't know it)
        ...(sort !== 'DEFAULT' ? { sort } : {}),
      },
    });
    return response.data;
  },

  /**
   * Fetches a paginated list of companies based on the provided filters.
   * This endpoint is public and does not require a JWT token.
   */
  getCompanies: async (
    category?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<CompaniesResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (category && category !== 'all') {
      params.set('category', category);
    }
    if (search) {
      params.set('search', search);
    }
    const response = await apiClient.get<CompaniesResponse>(
      `/users/companies?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Fetches a paginated list of real estate offices.
   * This endpoint is public and does not require a JWT token.
   */
  getOffices: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<OfficesResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) {
      params.set('search', search);
    }
    const response = await apiClient.get<OfficesResponse>(
      `/users/offices?${params.toString()}`,
    );
    return response.data;
  },
};
