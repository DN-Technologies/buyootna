import type { Metadata } from 'next'

import PropertyCard from '@/components/cards/PropertyCard'
import SearchFilter from '@/components/home/SearchFilter'
import ListingShell, { EmptyResults } from '@/components/layout/ListingShell'
import Pagination from '@/components/ui/Pagination'
import { LISTING_TYPES, PROPERTY_CATEGORIES } from '@/lib/categories'
import { getProperties } from '@/lib/data'
import { formatNumber } from '@/lib/format'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import {
  hrefWith,
  listParam,
  pageParam,
  param,
  type RawSearchParams,
} from '@/lib/searchParams'
import type { ListingType } from '@/lib/types'

export const metadata: Metadata = {
  title: 'العقارات — بيوتنا',
  description: 'تصفح العقارات المعروضة للبيع والإيجار والبدل في الكويت.',
}

const PAGE_SIZE = 12

/** A price from the URL as digits, or undefined for anything else. */
const priceParam = (params: RawSearchParams, key: string) => {
  const text = param(params, key)
  return text && /^\d+$/.test(text) ? text : undefined
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams

  // Only values the search offers reach the API; anything else is dropped
  const type = LISTING_TYPES.find((t) => t.id === param(params, 'type'))?.id as
    ListingType | undefined
  const governorateIds = listParam(params, 'governorateId').filter((id) =>
    GOVERNORATES.some((g) => g.id === id),
  )
  const offeredAreas = new Set(
    governorateIds.flatMap((id) => (AREAS[id] ?? []).map((area) => area.id)),
  )
  const areaIds = listParam(params, 'areaId').filter((id) =>
    offeredAreas.has(id),
  )
  const categories = listParam(params, 'category').filter((id) =>
    PROPERTY_CATEGORIES.some((c) => c.id === id),
  )
  const minPrice = priceParam(params, 'minPrice')
  const maxPrice = priceParam(params, 'maxPrice')
  const page = pageParam(params)

  const filters = {
    type,
    governorateId: governorateIds.join(',') || undefined,
    areaId: areaIds.join(',') || undefined,
    category: categories.join(',') || undefined,
    minPrice,
    maxPrice,
  }
  const { data, meta } = await getProperties({
    ...filters,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    limit: PAGE_SIZE,
  })

  return (
    <ListingShell
      title="العقارات"
      countLabel={meta.total ? `${formatNumber(meta.total)} إعلان` : undefined}
    >
      {/* Remounts with the URL so the fields always show the applied search */}
      <SearchFilter
        key={JSON.stringify(filters)}
        initial={{
          type,
          governorateIds,
          areaIds,
          categories,
          minPrice,
          maxPrice,
        }}
      />

      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyResults message="لا توجد عقارات مطابقة لبحثك. جرّب تغيير خيارات التصفية." />
      )}

      <Pagination
        current={meta.current || page}
        totalPages={meta.totalPages}
        hrefFor={(target) =>
          hrefWith('/properties', { ...filters, page: target })
        }
      />
    </ListingShell>
  )
}
