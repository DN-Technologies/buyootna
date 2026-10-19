export type RequestStatus = 'pending' | 'responded' | 'accepted' | 'rejected';

// 'mine' is the requester-facing scope (requests this identity submitted),
// surfaced in My Activity's عروضي tab.
export type RequestScope = 'company' | 'public' | 'mine';

export type RequestStatusFilter =
  | 'all'
  | 'pending'
  | 'accepted'
  | 'responded'
  | 'rejected';

// أين تم الاتفاق النهائي on انهاء الطلب
export type CompletedVia = 'in_app' | 'outside';

// The list's chips: a status, or المفضلة (the requests this company saved)
export type RequestListTab = RequestStatusFilter | 'saved';

// تصفية البحث on the requests list; every field optional
export interface RequestListFilters {
  specialty?: string;
  type?: string;
  priceFrom?: number;
  priceTo?: number;
  // A governorate or area name the request's location contains
  location?: string;
}

export interface RequestClientInfo {
  // The client's account, for الإبلاغ عن المستخدم
  userId?: string;
  name: string;
  joinedDate: string;
  previousOffers: number;
  // null until the client has a review
  rating: number | null;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  isVerified?: boolean;
}

// The company/office a request was sent to, or the one that accepted it
// (requester-facing, scope=mine)
export interface RequestProviderInfo {
  id: string;
  name: string;
  logoUrl: string | null;
  specialty: string | null;
  isVerified: boolean;
}

// What a company answered a request with
export interface RequestReply {
  // العرض يشمل
  message?: string | null;
  // العرض لا يشمل
  excludes?: string | null;
  notes?: string | null;
}

// One company's answer to a request (requester-facing)
export interface RequestOffer {
  id: string;
  provider: RequestProviderInfo;
  // What the company asks for (د.ك)
  price?: number | null;
  status?: 'sent' | 'accepted' | 'rejected';
  reply?: RequestReply | null;
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
  // القطعة / الشارع / الجادة / المنزل / علامة مميزة from the map picker
  addressDetails?: {
    block?: string;
    street?: string;
    avenue?: string;
    building?: string;
    landmark?: string;
  } | null;
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
  provider?: RequestProviderInfo | null;
  offers?: RequestOffer[];
  updatedAt?: string;
  // Quotes received so far (scope=mine)
  offersCount?: number;
  // This company saved the request (المفضلة)
  isSaved?: boolean;
  // The accepting company ended it (انهاء الطلب)
  completed?: boolean;
  completedVia?: CompletedVia | null;
}

