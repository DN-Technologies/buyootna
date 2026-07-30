import apiClient from '@/core/api/api';
import { CompanyProjectItemData } from '@/core/components/company/CompanyGalleryTab';
import { CompanyHeaderData } from '@/core/components/company/CompanyHeaderCard';
import { CompanyServiceItemData } from '@/core/components/company/CompanyServicesTab';

export interface CompanyDetailsResponse extends CompanyHeaderData {
  userId: string;
  phone?: string;
  whatsapp?: string;
  services: CompanyServiceItemData[];
  projects: CompanyProjectItemData[];
}

export const companyService = {
  /**
   * Fetches full company profile details by profile ID or user ID.
   */
  getCompanyDetails: async (id: string): Promise<CompanyDetailsResponse> => {
    const response = await apiClient.get<CompanyDetailsResponse>(
      `/users/company/${id}`,
    );
    return response.data;
  },
};
