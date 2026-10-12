import type { Metadata } from 'next'

import PropertyCard from '@/components/cards/PropertyCard'
import { EmptyResults } from '@/components/layout/ListingShell'
import PageHeader from '@/components/layout/PageHeader'
import PropertiesToolbar from '@/components/properties/PropertiesToolbar'
import PropertyFilters from '@/components/properties/PropertyFilters'
import Pagination from '@/components/ui/Pagination'
import { LISTING_TYPES, PROPERTY_CATEGORIES } from '@/lib/categories'
import { getProperties } from '@/lib/data'
import { formatNumber } from '@/lib/format'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import { SORTS, type SortId, type ViewId } from '@/lib/propertySorts'
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

  // Only values the filters offer reach the API; anything else is dropped
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
  const sort: SortId =
    SORTS.find((option) => option.id === param(params, 'sort'))?.id ?? 'DEFAULT'
  const view: ViewId = param(params, 'view') === 'list' ? 'list' : 'cards'
  const page = pageParam(params)

  const filters = {
    type,
    governorateId: governorateIds.join(',') || undefined,
    areaId: areaIds.join(',') || undefined,
    category: categories.join(',') || undefined,
    minPrice,
    maxPrice,
  }
  // Defaults stay out of the URL
  const display = {
    sort: sort === 'DEFAULT' ? undefined : sort,
    view: view === 'cards' ? undefined : view,
  }
  const { data, meta } = await getProperties({
    ...filters,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  })

  const typeTab = LISTING_TYPES.find((t) => t.id === type)?.tab
  const heading = typeTab ? `عقارات ${typeTab}` : 'كل العقارات'

  return (
    <>
      <PageHeader title="العقارات" />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-5 px-5 pb-24 lg:flex-row">
        <PropertyFilters
          values={{
            type,
            governorateIds,
            areaIds,
            categories,
            minPrice,
            maxPrice,
          }}
          sort={display.sort}
          view={display.view}
        />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[26px] leading-normal font-bold tracking-[-0.52px] text-ink">
              {heading}
            </h2>
            {meta.total > 0 && (
              <p className="shrink-0 text-sm font-medium text-muted">
                {formatNumber(meta.total)} إعلان
              </p>
            )}
          </div>
          <div className="h-px w-full bg-line" />
          <PropertiesToolbar filters={filters} sort={sort} view={view} />

          {data.length > 0 ? (
            <div
              className={
                view === 'list'
                  ? 'flex flex-col gap-5'
                  : 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
              }
            >
              {data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  layout={view === 'list' ? 'row' : 'card'}
                />
              ))}
            </div>
          ) : (
            <EmptyResults message="لا توجد عقارات مطابقة لبحثك. جرّب تغيير خيارات التصفية." />
          )}

          <Pagination
            current={meta.current || page}
            totalPages={meta.totalPages}
            hrefFor={(target) =>
              hrefWith('/properties', { ...filters, ...display, page: target })
            }
          />
        </div>
      </div>
    </>
  )
}
