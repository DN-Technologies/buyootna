import {
  CompanyRequestItem,
  RequestScope,
  RequestStatusFilter,
} from '@/features/company/components/requests/types';
import apiClient from '@/shared/api/api';
import { propertiesService } from '@/shared/api/properties.service';

export interface GetCompanyRequestsParams {
  scope: RequestScope;
  status?: RequestStatusFilter;
  search?: string;
}

export interface CreateCompanyRequestPayload {
  title: string;
  category?: string;
  priceRange?: string;
  offerType?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  /** Local image URIs — uploaded to media storage before creating. */
  images?: string[];
  /** Omit for a public/marketplace request. */
  targetIdentityId?: string;
}

export const companyRequestsService = {
  create: async (payload: CreateCompanyRequestPayload): Promise<void> => {
    const { images, ...body } = payload;

    // Attachments start as local device URIs; the API stores URLs.
    const uploadedImages = images?.length
      ? await propertiesService.uploadImages(images)
      : [];

    await apiClient.post('/company-requests', {
      ...body,
      images: uploadedImages,
    });
  },

  getMine: async (
    params: GetCompanyRequestsParams,
  ): Promise<CompanyRequestItem[]> => {
    const response = await apiClient.get<CompanyRequestItem[]>(
      '/company-requests/me',
      { params },
    );
    return response.data;
  },

  getById: async (id: string): Promise<CompanyRequestItem> => {
    const response = await apiClient.get<CompanyRequestItem>(
      `/company-requests/${id}`,
    );
    return response.data;
  },

  accept: async (id: string): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/accept`,
    );
    return response.data;
  },

  reject: async (id: string): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/reject`,
    );
    return response.data;
  },

  markResponded: async (id: string): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/mark-responded`,
    );
    return response.data;
  },
};
