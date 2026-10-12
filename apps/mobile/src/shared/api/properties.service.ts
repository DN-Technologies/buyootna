import { Image } from 'expo-image';

import apiClient from '@/shared/api/api';
import type { AddressDetails } from '@/shared/components/map/picker/addressTypes';
import { PropertyDetailsDto } from '@/types/property';

// The shape of the payload we send to POST /properties
export interface CreatePropertyPayload {
  isDraft: boolean;
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  category: string;
  areaSize: number;
  // Omitted for categories that have none (land, farm)
  beds?: number;
  baths?: number;
  location: string;
  description: string;
  images: string[];
  propertyAge?: number;
  addressDetails?: AddressDetails;
  latitude?: number;
  longitude?: number;
  price?: number;
  propertyIncome?: number;
  requestYear?: number;
  requiredYear?: number;
  exchangeStatus?: string;
  isFeatured?: boolean;
  // null clears the number on an edit
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  allocationStatus?: string;
  automatedNumber?: string;
  features?: { id: string; label: string }[];
  floors?: number;
  governorateId?: string;
  areaId?: string;
  additionalExpenses?: string;
  rentConditions?: string;
  planSlotId?: string;
  submissionKey?: string;
}

export interface CreatePropertyResponse {
  message: string;
  property: {
    id: string;
    [key: string]: unknown;
  };
}

export interface UploadImagesResponse {
  message: string;
  urls: string[];
}

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

  /**
   * Fetches full property details, prefetches the hero image, and silently pings view count.
   */
  getPropertyDetails: async (id: string): Promise<PropertyDetailsDto> => {
    const data = await propertiesService.getPropertyById(id);

    if (data.images && data.images.length > 0) {
      try {
        await Image.prefetch(data.images[0]);
      } catch (e) {
        console.warn('Prefetch failed:', e);
      }
    }

    // Silently ping the view counter in the background.
    propertiesService.incrementViews(id).catch(() => {});

    return data;
  },

  /**
   * Upload local image URIs to the backend (which stores them in S3).
   * Uses multipart/form-data since we're sending binary files.
   */
  uploadImages: async (localUris: string[]): Promise<string[]> => {
    const formData = new FormData();

    for (const uri of localUris) {
      // Determine the file extension and MIME type from the URI
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      // React Native's FormData accepts this object shape for file uploads
      formData.append('images', {
        uri: uri,
        type: mimeType,
        name: filename,
      } as unknown as Blob);
    }

    const response = await apiClient.post<UploadImagesResponse>(
      '/media/upload/listings',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Image uploads can take longer than the default 10s timeout
        timeout: 60000,
      },
    );

    return response.data.urls;
  },

  /**
   * Create a new property listing (publish or save as draft).
   */
  createProperty: async (
    payload: CreatePropertyPayload,
  ): Promise<CreatePropertyResponse> => {
    const response = await apiClient.post<CreatePropertyResponse>(
      '/properties',
      payload,
    );
    return response.data;
  },

  /**
   * Update an existing property listing (edit or publish a draft).
   */
  updateProperty: async (
    id: string,
    payload: Partial<CreatePropertyPayload>,
  ): Promise<CreatePropertyResponse> => {
    const response = await apiClient.patch<CreatePropertyResponse>(
      `/properties/${id}`,
      payload,
    );
    return response.data;
  },
  /**
   * Fetch features metadata list from backend.
   */
  getFeaturesMetadata: async (): Promise<{
    sell: { id: string; label: string }[];
    rent: { id: string; label: string }[];
    exchange: { id: string; label: string }[];
  }> => {
    const response = await apiClient.get('/properties/metadata/features');
    return response.data;
  },
};
