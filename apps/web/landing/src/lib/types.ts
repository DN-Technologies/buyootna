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
