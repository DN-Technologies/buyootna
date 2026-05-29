export interface PropertyWithCompanyUser {
  id: string;
  images: string[];
  price: number;
  isFeatured: boolean;
  category: string;
  area: number;
  beds: number;
  baths: number;
  location: string;
  user: {
    companyProfile: {
      name: string;
    } | null;
  };
}

export interface CompanyUserProfile {
  companyProfile: {
    id: string;
    name: string;
    services: string;
    serviceAreas: string;
    logoUrl: string | null;
    isVerified: boolean;
  } | null;
}
