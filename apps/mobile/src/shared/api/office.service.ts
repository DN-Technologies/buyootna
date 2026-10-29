import type { OfficeDashboard } from '@/features/office/types';
import apiClient from '@/shared/api/api';
import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import { ResponseTime } from '@/shared/utils/helpers/activity';
import type { WorkingDay } from '@/shared/utils/workingHours';
import { PropertyDto } from '@/types/feed';

export interface OfficeHeaderData {
  id: string;
  userId?: string;
  name: string;
  logoUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  isActiveNow?: boolean;
  lastSeenAt?: string | null;
  rating: number;
  reviewsCount: number;
  bio?: string;
  location?: string;
  licenseNumber?: string;
  listingsCount: number;
  servicesCount: number;
  responseTime?: ResponseTime | null;
  instagramUrl?: string;
  twitterUrl?: string;
  phone?: string;
  whatsapp?: string;
}

export interface OfficeDetailsResponse extends OfficeHeaderData {
  // مواعيد العمل as the office set them (null: not set)
  workingHours?: WorkingDay[] | null;
  services: CompanyServiceItemData[];
  properties: PropertyDto[];
}

export const officeService = {
  /**
   * The signed-in office's home: stats, ad-package state, its active ads
   * and its services (403 for any other persona).
   */
  getDashboard: async (): Promise<OfficeDashboard> => {
    const response = await apiClient.get<OfficeDashboard>(
      '/offices/me/dashboard',
    );
    return response.data;
  },

  /**
   * Fetches full office profile details by profile ID or user ID.
   */
  getOfficeDetails: async (id: string): Promise<OfficeDetailsResponse> => {
    const response = await apiClient.get<OfficeDetailsResponse>(
      `/users/office/${id}`,
    );
    return response.data;
  },
};
