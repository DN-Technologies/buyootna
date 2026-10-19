import {
  CompanyRequestItem,
  RequestListFilters,
  RequestScope,
  RequestStatusFilter,
} from '@/features/company/components/requests/types';
import apiClient from '@/shared/api/api';
import { propertiesService } from '@/shared/api/properties.service';
import type { AddressDetails } from '@/shared/components/map/picker/addressTypes';

export interface GetCompanyRequestsParams extends RequestListFilters {
  scope: RequestScope;
  status?: RequestStatusFilter;
  search?: string;
  // المفضلة: only the requests this company saved
  saved?: boolean;
}

// الرد على العميل: both optional, but one of them is needed
export interface RequestReplyPayload {
  message?: string;
  notes?: string;
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

  // The company's reply (an offer the client sees); notifies the client
  respond: async (
    id: string,
    payload: RequestReplyPayload,
  ): Promise<CompanyRequestItem> => {
    const response = await apiClient.post<CompanyRequestItem>(
      `/company-requests/${id}/offers`,
      payload,
    );
    return response.data;
  },

  // اضافة الى المفضلة / إزالة من المفضلة
  bookmark: async (id: string): Promise<void> => {
    await apiClient.post(`/company-requests/${id}/bookmark`);
  },

  unbookmark: async (id: string): Promise<void> => {
    await apiClient.delete(`/company-requests/${id}/bookmark`);
  },

  markResponded: async (id: string): Promise<CompanyRequestItem> => {
    const response = await apiClient.patch<CompanyRequestItem>(
      `/company-requests/${id}/mark-responded`,
    );
    return response.data;
  },
};
