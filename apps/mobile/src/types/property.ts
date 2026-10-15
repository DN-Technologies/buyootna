export interface PropertyDetailsDto {
  id: string;
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  category: string;
  isFeatured: boolean;
  price: number;
  area: number;
  // null for categories that have none (land, farm)
  beds: number | null;
  baths: number | null;
  location: string;
  description: string;
  views: number;
  images: string[];
  createdAt: string;
  // When the ad last went live (publish or republish); older APIs omit it
  publishedAt?: string | null;
  floors?: number | null;
  // Per-category fields (requirements doc)
  floorNumber?: number | null;
  apartmentsCount?: number | null;
  rentalStatus?: string | null;
  landUse?: string | null;
  unitsCount?: number | null;
  monthlyIncome?: number | null;
  isCultivated?: boolean | null;
  isBuilt?: boolean | null;
  isOwner?: boolean | null;
  requestYear?: number;
  requiredYear?: number;
  licenseNumber?: string;
  governorateId?: string | null;
  areaId?: string | null;
  areaSize?: number | null;
  automatedNumber?: string | null;
  propertyAge?: number | null;
  phoneNumber?: string | null;
  // The ad's own WhatsApp number, when the advertiser gave one
  whatsappNumber?: string | null;
  // حالة التخصيص on exchange ads
  allocationStatus?: string | null;
  phone?: string | null;
  referenceNumber?: number;
  features?: { id: string; label: string }[] | null;
  propertyIncome?: number | null;
  additionalExpenses?: string | null;
  rentConditions?: string | null;
  // القطعة / الشارع / الجادة / المنزل / علامة مميزة
  addressDetails?: {
    block?: string;
    street?: string;
    avenue?: string;
    building?: string;
    landmark?: string;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  host: {
    id: string;
    name: string;
    avatarUrl: string;
    joinedDate: string;
    isVerified: boolean;
    rating: number;
    reviewsCount?: number;
    // The persona's contact number (its own, or the account's)
    phone?: string | null;
    role?: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  };
}
