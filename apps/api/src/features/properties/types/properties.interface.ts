export interface PropertyWithCompanyUser {
  id: string;
  images: string[];
  price: number | null;
  isFeatured: boolean;
  category: string;
  areaSize: number | null;
  beds: number | null;
  baths: number | null;
  location: string;
  createdAt: Date;
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
    services: string | null;
    serviceAreas: string | null;
    logoUrl: string | null;
    isVerified: boolean;
  } | null;
}
