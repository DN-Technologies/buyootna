import {
  CompanyRequestItem,
  RequestScope,
  RequestStatusFilter,
} from '@/features/company/components/requests/types';
import apiClient from '@/shared/api/api';

export interface GetCompanyRequestsParams {
  scope: RequestScope;
  status?: RequestStatusFilter;
  search?: string;
}

export const companyRequestsService = {
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
