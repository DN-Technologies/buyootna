import apiClient from '@/core/api/api';
import { PropertyDetailsDto } from '@/types/property';

export const propertiesService = {
  getPropertyById: async (id: string): Promise<PropertyDetailsDto> => {
    const response = await apiClient.get<PropertyDetailsDto>(
      `/properties/${id}`,
    );
    return response.data;
  },

  incrementViews: async (id: string): Promise<void> => {
    // We don't need to return data here, just fire and forget
    await apiClient.patch(`/properties/${id}/view`);
  },
};
