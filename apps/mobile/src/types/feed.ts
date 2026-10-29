// --- Property Modal ---
export interface PropertyDto {
  id: string;
  images: string[];
  price: number;
  companyName: string;
  isFeatured: boolean;
  type: string; // e.g., 'سكني', 'تجاري', 'استثماري'
  categoryLabel?: string; // e.g., 'عمارة', 'شقة', 'فيلا'
  area: number;
  beds: number;
  baths: number;
  location: string;
  createdAt: string;
  publishedAt?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  propertyIncome?: number | null;
  // Owning identity (the ad's host)
  identityId?: string;
  identityType?: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  // An office profile's listings: the deal (`type` above is the category
  // group), the governorate, and an exchange's two years
  listingType?: 'SALE' | 'RENT' | 'EXCHANGE';
  governorateId?: string | null;
  requestYear?: number | null;
  requiredYear?: number | null;
}

// --- Company Modal ---
export interface CompanyDto {
  id: string;
  userId: string;
  name: string;
  category: string; // e.g., 'تشطيب • تصميم داخلي • تنفيذ'
  rating: number;
  reviewsCount: number;
  projectsCount: string; // e.g., '+50'
  // عدد الخدمات (newer APIs)
  servicesCount?: number;
  serviceArea: string;
  logoUrl: string;
  isVerified: boolean;
  isFavorite?: boolean;
  lastActivityAt: string;
}

// --- Office Modal ---
export interface OfficeDto {
  id: string;
  userId: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  logoUrl: string;
  isVerified: boolean;
  isFavorite?: boolean;
  // Live ads, their deal types (SALE/RENT/EXCHANGE) and its services count
  // (newer APIs)
  propertiesCount?: number;
  listingTypes?: string[];
  servicesCount?: number;
  phone?: string | null;
  whatsapp?: string | null;
}

// --- The Combined Feed Response ---
export interface HomeFeedResponse {
  sale: PropertyDto[];
  rent: PropertyDto[];
  exchange: PropertyDto[];
  companies: CompanyDto[];
}

// --- Fatch Properties Response ---
export interface PropertiesResponse {
  data: PropertyDto[];
  meta: {
    total: number;
    current: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// --- Fetch Companies Response ---
export interface CompaniesResponse {
  data: CompanyDto[];
  meta: {
    total: number;
    current: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// --- Fetch Offices Response ---
export interface OfficesResponse {
  data: OfficeDto[];
  meta: {
    total: number;
    current: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
