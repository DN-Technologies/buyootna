import {
  CompaniesResponse,
  HomeFeedResponse,
  PropertiesResponse,
} from '@/types/feed';

import apiClient from './api';

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
    type: 'SALE' | 'RENT' | 'EXCHANGE',
    page: number = 1,
    limit: number = 10,
  ): Promise<PropertiesResponse> => {
    const response = await apiClient.get<PropertiesResponse>(
      `/properties?type=${type}&page=${page}&limit=${limit}`,
    );
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
    const response = await apiClient.get<CompaniesResponse>(
      `/users/companies?category=${category}&page=${page}&limit=${limit}`,
    );
    return response.data;
  },
};
