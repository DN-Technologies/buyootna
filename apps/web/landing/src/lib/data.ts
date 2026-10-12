import type { Company, ListingType, Office, Page, Property } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.buyootna.cloud'
// The public lists change slowly; a few minutes of caching keeps the site fast
const REVALIDATE_SECONDS = 300

const EMPTY_META = {
  total: 0,
  current: 1,
  limit: 0,
  totalPages: 0,
  hasNextPage: false,
}

type Query = Record<string, string | number | undefined | null>

function toQueryString(query: Query): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

/**
 * A page of a public list. A failed or malformed response comes back as an
 * empty page, so one unavailable list never takes the whole page down.
 */
async function getPage<T>(path: string, query: Query): Promise<Page<T>> {
  try {
    const response = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return { data: [], meta: EMPTY_META }
    const body = (await response.json()) as Partial<Page<T>>
    return {
      data: Array.isArray(body.data) ? body.data : [],
      meta: body.meta ?? EMPTY_META,
    }
  } catch {
    return { data: [], meta: EMPTY_META }
  }
}

export interface PropertyQuery {
  type?: ListingType
  governorateId?: string
  areaId?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'DEFAULT' | 'NEWEST'
  page?: number
  limit?: number
}

export const getProperties = (query: PropertyQuery = {}) =>
  getPage<Property>('/properties', { ...query })

export interface CompanyQuery {
  category?: string
  search?: string
  // Comma-separated, as the search box sends them
  specialty?: string
  location?: string
  page?: number
  limit?: number
}

export const getCompanies = (query: CompanyQuery = {}) =>
  getPage<Company>('/users/companies', { ...query })

export interface OfficeQuery {
  search?: string
  location?: string
  page?: number
  limit?: number
}

export const getOffices = (query: OfficeQuery = {}) =>
  getPage<Office>('/users/offices', { ...query })
