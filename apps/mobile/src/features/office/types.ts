// GET /offices/me/dashboard
export interface OfficeDashboardStats {
  activeListings: number;
  activeListingsThisWeek: number;
  activeServices: number;
  newMessagesToday: number;
  totalViews: number;
}

export interface OfficeDashboardBilling {
  hasActivePackage: boolean;
  adsRemaining: number;
  freeAdsRemaining: number;
}

export interface OfficeDashboardListing {
  id: string;
  type: 'SALE' | 'RENT' | 'EXCHANGE' | 'AUCTION' | 'DEAL';
  // PropertyCategory key (APARTMENT, HOUSE ...)
  category: string;
  // null: السعر غير معلن
  price: number | null;
  images: string[];
  isFeatured: boolean;
  featuredUntil: string | null;
  views: number;
  favoritesCount: number;
  chatsCount: number;
}

export interface OfficeDashboardService {
  title: string;
  // Open requests sent to the office that mention the service
  openRequests: number;
}

export interface OfficeDashboard {
  stats: OfficeDashboardStats;
  billing: OfficeDashboardBilling;
  listings: OfficeDashboardListing[];
  services: OfficeDashboardService[];
}

export type OfficeListingType = 'sell' | 'rent' | 'exchange';

export interface OfficeAddListingFormData {
  listingType: OfficeListingType;
  governorate: string;
  area: string;
  mapLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  category: string;
  space: string;
  propertyAge: string;
  paciNumber: string;
  roomsCount: number;
  bathroomsCount: number;
  features: string;
  isPriceActive: boolean;
  price?: string;
  phone: string;
  description: string;
  images: string[];
}

