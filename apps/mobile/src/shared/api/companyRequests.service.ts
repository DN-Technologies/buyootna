import {
  CompanyRequestItem,
  RequestScope,
  RequestStatusFilter,
} from '@/features/company/components/requests/types';
import apiClient from '@/shared/api/api';
import { propertiesService } from '@/shared/api/properties.service';
import type { AddressDetails } from '@/shared/components/map/picker/addressTypes';

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
  // القطعة / الشارع / الجادة / المنزل / علامة مميزة from the map picker
  addressDetails?: AddressDetails;
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

  // Requester actions (the user's own requests)
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/company-requests/${id}`);
  },

  removeAllMine: async (): Promise<void> => {
    await apiClient.delete('/company-requests/me');
  },

  // offerId is only needed when several companies answered
  acceptOffer: async (
    id: string,
    offerId?: string,
  ): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/accept-offer`,
      offerId ? { offerId } : {},
    );
    return response.data;
  },

  rejectOffer: async (
    id: string,
    offerId?: string,
  ): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/reject-offer`,
      offerId ? { offerId } : {},
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
