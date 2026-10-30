// Shapes of the public API's list endpoints, as the cards use them.

export type ListingType = 'SALE' | 'RENT' | 'EXCHANGE'

export interface Property {
  id: string
  images: string[]
  price: number | null
  // The advertiser's display name
  companyName: string
  isFeatured: boolean
  // e.g. "عمارة", "شقة"
  categoryLabel: string
  // What the ad offers the property for
  listingType?: ListingType
  // Exchange ads: سنة الطلب and السنة المطلوبة
  requestYear?: number | null
  requiredYear?: number | null
  area: number | null
  propertyIncome: number | null
  location: string
  createdAt: string
  publishedAt: string | null
}

export interface Company {
  id: string
  name: string
  // The company's services, separated by " • "
  category: string
  rating: number
  reviewsCount: number
  projectsCount: string
  serviceArea: string | null
  logoUrl: string | null
  isVerified: boolean
}

export interface Office {
  id: string
  name: string
  rating: number
  reviewsCount: number
  location: string | null
  logoUrl: string | null
  isVerified: boolean
  phone: string | null
}

export interface PageMeta {
  total: number
  current: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}

// GET /properties/:id, as the ad page uses it
export interface PropertyDetails {
  id: string
  referenceNumber: number
  type: ListingType
  // The API's PropertyCategory value, e.g. "APARTMENT"
  category: string
  status: string
  isHidden: boolean
  isFeatured: boolean
  price: number | null
  location: string
  governorateId: string | null
  areaId: string | null
  areaSize: number | null
  description: string
  images: string[]
  views: number
  createdAt: string
  publishedAt: string | null
  beds: number | null
  baths: number | null
  floors: number | null
  // What the category adds (requirements doc): a flat's floor, a building's
  // flats and rental status, land's use, commercial / investment units and
  // monthly income, a farm's مزروعة / مبنية
  floorNumber?: number | null
  apartmentsCount?: number | null
  rentalStatus?: string | null
  landUse?: string | null
  unitsCount?: number | null
  monthlyIncome?: number | null
  isCultivated?: boolean | null
  isBuilt?: boolean | null
  // An individual who confirmed they own the property
  isOwner?: boolean | null
  // مزايا العقار, as the app saved them
  features: ({ id?: string; label?: string } | string)[] | null
  propertyIncome: number | null
  // Rent ads
  rentConditions: string | null
  additionalExpenses: string | null
  // Exchange ads
  requestYear: number | null
  requiredYear: number | null
  allocationStatus: string | null
  latitude: number | null
  longitude: number | null
  // The ad's own contact number, when it has one
  phoneNumber: string | null
  // An office's licence number
  licenseNumber?: string | null
  host: {
    id?: string
    name: string
    avatarUrl: string
    // "06/2026"
    joinedDate: string
    isVerified: boolean
    rating: number
    reviewsCount: number
    phone: string | null
    role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE'
  }
}

/** A reel from GET /reels/:id, as a guest sees it. */
export interface PublicReel {
  id: string;
  mediaUrl: string;
  posterUrl: string;
  caption: string | null;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  author: {
    identityId: string;
    type: 'COMPANY' | 'OFFICE';
    name: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
  property: {
    id: string;
    type: string;
    category: string;
    location: string;
    coverUrl: string | null;
  } | null;
}
