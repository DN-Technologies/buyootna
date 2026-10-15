import { api } from '@/lib/api'
import type { ListingType } from '@/lib/types'

// What a signed-in account does on the site: post ads, set alerts and ask
// companies for quotes.

// --- Publishing an ad ---

export interface PublishOption {
  // "FREE_QUOTA" or a package slot
  type: string
  slotId: string
  title: string
  subtitle: string
  adsRemaining: number
}

/** The free ad and packages this account can publish with right now. */
export async function getPublishOptions() {
  const { data } = await api.get<{ canPublish: boolean; options: PublishOption[] }>(
    '/plans/wallet/publish-options',
  )
  return data
}

export interface FeatureOption {
  id: string
  label: string
}

const FEATURE_KEYS: Record<ListingType, 'sell' | 'rent' | 'exchange'> = {
  SALE: 'sell',
  RENT: 'rent',
  EXCHANGE: 'exchange',
}

/** مزايا العقار offered for each listing type. */
export async function getFeatures(): Promise<Record<ListingType, FeatureOption[]>> {
  const { data } = await api.get<Record<string, FeatureOption[]>>(
    '/properties/metadata/features',
  )
  return {
    SALE: data[FEATURE_KEYS.SALE] ?? [],
    RENT: data[FEATURE_KEYS.RENT] ?? [],
    EXCHANGE: data[FEATURE_KEYS.EXCHANGE] ?? [],
  }
}

/** Stores photos and resolves with their URLs, in the order given. */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return []
  const body = new FormData()
  files.forEach((file) => body.append('images', file))
  const { data } = await api.post<{ urls: string[] }>('/media/upload/listings', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return data.urls
}

export interface AdPayload {
  isDraft: boolean
  // One per publish attempt, so a retry can't post the ad twice
  submissionKey?: string
  planSlotId?: string
  type: ListingType
  category: string
  governorateId: string
  areaId?: string
  location: string
  latitude?: number
  longitude?: number
  areaSize: number
  beds?: number
  baths?: number
  floors?: number
  propertyAge?: number
  floorNumber?: number
  apartmentsCount?: number
  rentalStatus?: string
  landUse?: string
  unitsCount?: number
  monthlyIncome?: number
  isCultivated?: boolean
  isBuilt?: boolean
  // An individual's «أنا مالك العقار»
  isOwner?: boolean
  automatedNumber?: string
  features: FeatureOption[]
  price?: number
  propertyIncome?: number
  requestYear?: number
  requiredYear?: number
  allocationStatus?: string
  additionalExpenses?: string
  rentConditions?: string
  phoneNumber: string
  description: string
  images: string[]
}

export async function createAd(payload: AdPayload) {
  const { data } = await api.post<{ id: string }>('/properties', payload)
  return data
}

/** True when the API refused a publish because no free ad or package is left. */
export const isOutOfAds = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code ===
  'PACKAGE_UNUSABLE'

// --- Alerts ---

export interface AlertPayload {
  type: 'PROPERTIES'
  operationType: ListingType
  governorateId: string
  areaId?: string
  categoryId?: string
  price?: number
  rentValue?: number
  areaSize?: number
  rooms?: number
  baths?: number
  floors?: number
  requestYear?: number
  requiredYear?: number
  amenities?: string[]
}

export async function createAlert(payload: AlertPayload) {
  await api.post('/alerts', payload)
}

// --- Quote requests ---

export interface QuotePayload {
  // The specialty asked for; also the request's title
  title: string
  category: string
  offerType?: string
  priceRange?: string
  location: string
  latitude?: number
  longitude?: number
  description: string
  images: string[]
}

export async function createQuoteRequest(payload: QuotePayload) {
  await api.post('/company-requests', payload)
}

// The kinds of request, as the mobile app lists them
export const QUOTE_REQUEST_TYPES = [
  'عرض سعر',
  'استشارة',
  'معاينة موقع',
  'تنفيذ مشروع كامل',
]
