export type RequestStatus = 'pending' | 'responded' | 'accepted' | 'rejected';

export type RequestScope = 'company' | 'public';

export type RequestStatusFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'responded'
  | 'rejected';

export interface RequestClientInfo {
  name: string;
  joinedDate: string;
  previousOffers: number;
  rating: number;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  isVerified?: boolean;
}

export interface CompanyRequestItem {
  id: string;
  clientIdentityId: string;
  title: string;
  clientName: string;
  requestNumber?: string;
  category?: string;
  priceRange?: string;
  location: string;
  attachmentsCount: number;
  publishTime?: string;
  offerType?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  description: string;
  status: RequestStatus;
  scope: RequestScope;
  createdAt: string;
  client?: RequestClientInfo;
}

