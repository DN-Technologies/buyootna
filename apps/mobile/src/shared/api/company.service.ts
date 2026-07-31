import apiClient from '@/shared/api/api';
import { CompanyProjectItemData } from '@/shared/components/company/CompanyGalleryTab';
import { CompanyHeaderData } from '@/shared/components/company/CompanyHeaderCard';
import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';

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
