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

  /**
   * Creates a portfolio project for the current company profile.
   */
  createProject: async (data: {
    title: string;
    description: string;
    images: string[];
  }): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/users/profile/projects', data);
    return response.data;
  },

  /**
   * Creates a customer invoice for the current company profile.
   */
  createInvoice: async (data: {
    clientName: string;
    title: string;
    warrantyMonths?: string;
    issueDate: string;
    items: { name: string; price: number; qty: number }[];
    discount?: number;
  }): Promise<{
    success: boolean;
    invoice: { invoiceNo: string; total: number };
  }> => {
    const response = await apiClient.post('/users/profile/invoices', data);
    return response.data;
  },
};
