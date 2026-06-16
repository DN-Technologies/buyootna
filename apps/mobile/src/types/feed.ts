// --- Property Modal ---
export interface PropertyDto {
  id: string;
  images: string[];
  price: number;
  companyName: string;
  isFeatured: boolean;
  type: string; // e.g., 'سكني', 'تجاري', 'استثماري'
  area: number;
  beds: number;
  baths: number;
  location: string;
  createdAt: string;
}

// --- Company Modal ---
export interface CompanyDto {
  id: string;
  name: string;
  category: string; // e.g., 'تشطيب • تصميم داخلي • تنفيذ'
  rating: number;
  projectsCount: string; // e.g., '+50'
  serviceArea: string;
  logoUrl: string;
  isVerified: boolean;
  isFavorite?: boolean;
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
