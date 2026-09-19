export type RequestStatus = 'pending' | 'responded' | 'accepted';

export type RequestScope = 'company' | 'public';

export type RequestStatusFilter = 'all' | 'pending' | 'accepted' | 'responded';

export interface CompanyRequestItem {
  id: string;
  title: string;
  clientName: string;
  priceRange?: string;
  location: string;
  attachmentsCount: number;
  description: string;
  status: RequestStatus;
  scope: RequestScope;
  createdAt?: string;
}
