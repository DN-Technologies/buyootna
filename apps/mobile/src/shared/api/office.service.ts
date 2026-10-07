import apiClient from '@/shared/api/api';
import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import { WorkingHourItem } from '@/shared/components/company/CompanyWorkingHours';
import { ResponseTime } from '@/shared/utils/helpers/activity';
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
  workingHours?: WorkingHourItem[];
  services: CompanyServiceItemData[];
  properties: PropertyDto[];
}

export const officeService = {
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
