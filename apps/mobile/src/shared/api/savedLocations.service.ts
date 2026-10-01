import apiClient from '@/shared/api/api';
import type { AddressDetails } from '@/shared/components/map/picker/addressTypes';

export type SavedLocationLabel = 'HOME' | 'WORK' | 'OTHER';

export interface SavedLocation {
  id: string;
  label: SavedLocationLabel;
  name: string | null;
  address: string;
  latitude: number;
  longitude: number;
  details: AddressDetails | null;
}

export interface SaveLocationPayload {
  label: SavedLocationLabel;
  name?: string;
  address: string;
  latitude: number;
  longitude: number;
  details?: AddressDetails;
}

/** The location picker's saved places (المنزل / العمل / custom). */
export const savedLocationsService = {
  list: async (): Promise<SavedLocation[]> => {
    const response = await apiClient.get<SavedLocation[]>('/saved-locations');
    return response.data;
  },

  save: async (payload: SaveLocationPayload): Promise<SavedLocation> => {
    const response = await apiClient.post<SavedLocation>(
      '/saved-locations',
      payload,
    );
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/saved-locations/${id}`);
  },
};
