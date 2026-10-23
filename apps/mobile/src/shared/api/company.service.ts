import apiClient from '@/shared/api/api';
import { CompanyProjectItemData } from '@/shared/components/company/CompanyGalleryTab';
import { CompanyHeaderData } from '@/shared/components/company/CompanyHeaderCard';
import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import type { WorkingDay } from '@/shared/utils/workingHours';

export interface CompanyDetailsResponse extends CompanyHeaderData {
  userId: string;
  phone?: string;
  whatsapp?: string;
  services: CompanyServiceItemData[];
  projects: CompanyProjectItemData[];
  // مواعيد العمل as the company set them (null: not set)
  workingHours?: WorkingDay[] | null;
}

// One of the current company's projects, as GET /users/profile/projects
// returns it
export interface MyCompanyProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  // حالة ظهور المشروع: hidden ones are off the public profile
  isHidden: boolean;
  createdAt: string;
}

// What تعديل المشروع can change
export interface ProjectUpdate {
  title?: string;
  description?: string;
  images?: string[];
  isHidden?: boolean;
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
   * Adds services to the current company: one per chosen type. The first
   * one fixes the company's specialty.
   */
  createService: async (data: {
    specialty: string;
    types: string[];
    title?: string;
    description?: string;
  }): Promise<{ success: boolean; created: number }> => {
    const response = await apiClient.post('/users/profile/services', data);
    return response.data;
  },

  /**
   * The current company's services and its specialty.
   */
  getMyServices: async (): Promise<{
    specialty: string | null;
    services: {
      id: string;
      type: string;
      title: string | null;
      description?: string | null;
    }[];
  }> => {
    const response = await apiClient.get('/users/profile/services');
    return response.data;
  },

  /**
   * Removes one of the current company's services.
   */
  deleteService: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/users/profile/services/${id}`);
    return response.data;
  },

  /**
   * The current company's معرض الأعمال projects, newest first.
   */
  getMyProjects: async (): Promise<MyCompanyProject[]> => {
    const response = await apiClient.get('/users/profile/projects');
    return response.data;
  },

  /**
   * Removes one of the current company's معرض الأعمال projects.
   */
  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/users/profile/projects/${id}`);
    return response.data;
  },

  /**
   * Edits one of the current company's projects (text, photos, and
   * حالة ظهور المشروع).
   */
  updateProject: async (
    id: string,
    patch: ProjectUpdate,
  ): Promise<{ success: boolean; project: MyCompanyProject }> => {
    const response = await apiClient.patch(
      `/users/profile/projects/${id}`,
      patch,
    );
    return response.data;
  },

  /** اخفاء / اظهار جميع المشاريع. */
  setAllProjectsHidden: async (
    isHidden: boolean,
  ): Promise<{ success: boolean; updated: number }> => {
    const response = await apiClient.patch('/users/profile/projects', {
      isHidden,
    });
    return response.data;
  },

  /** حذف الكل: every project of the current company. */
  deleteAllProjects: async (): Promise<{ success: boolean; deleted: number }> => {
    const response = await apiClient.delete('/users/profile/projects');
    return response.data;
  },

  /**
   * Issues a service invoice from the current company persona. With
   * requestId (one of its accepted requests) it reaches that client's
   * فواتير الخدمات; otherwise clientName names a client outside the app.
   */
  createInvoice: async (data: {
    requestId?: string;
    clientName?: string;
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
