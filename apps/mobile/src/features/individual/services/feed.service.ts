import {
  CompaniesResponse,
  HomeFeedResponse,
  PropertiesResponse,
} from '@/types/feed';

import apiClient from '@/shared/api/api';

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
  ): Promise<PropertiesResponse> => {
    let url = `/properties?page=${page}&limit=${limit}`;
    if (type) {
      url = `/properties?type=${type}&page=${page}&limit=${limit}`;
    }
    console.log('URL', url);
    const response = await apiClient.get<PropertiesResponse>(url);
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
  ): Promise<CompaniesResponse> => {
    let url = `/users/companies?page=${page}&limit=${limit}`;
    if (category && category !== 'all') {
      url = `/users/companies?category=${category}&page=${page}&limit=${limit}`;
    }
    const response = await apiClient.get<CompaniesResponse>(url);
    return response.data;
  },
};
