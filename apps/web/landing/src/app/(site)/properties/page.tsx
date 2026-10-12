import type { Metadata } from 'next'

import PropertyCard from '@/components/cards/PropertyCard'
import { EmptyResults } from '@/components/layout/ListingShell'
import PageHeader from '@/components/layout/PageHeader'
import ActiveFilters, {
  type FilterChip,
} from '@/components/properties/ActiveFilters'
import PropertiesMap from '@/components/properties/PropertiesMap'
import PropertiesToolbar from '@/components/properties/PropertiesToolbar'
import PropertyFilters from '@/components/properties/PropertyFilters'
import Pagination from '@/components/ui/Pagination'
import { categoriesFor, LISTING_TYPES } from '@/lib/categories'
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

/** A number from the URL as digits, or undefined for anything else. */
const digitsParam = (params: RawSearchParams, key: string) => {
  const text = param(params, key)
  return text && /^\d+$/.test(text) ? text : undefined
}
const yearParam = (params: RawSearchParams, key: string) => {
  const text = param(params, key)
  return text && /^(19|20)\d{2}$/.test(text) ? text : undefined
}

const without = (list: string[], id: string) =>
  list.filter((value) => value !== id).join(',') || undefined

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
  const areaOptions = governorateIds.flatMap((id) => AREAS[id] ?? [])
  const areaIds = listParam(params, 'areaId').filter((id) =>
    areaOptions.some((area) => area.id === id),
  )
  const categoryOptions = categoriesFor(type)
  const categories = listParam(params, 'category').filter((id) =>
    categoryOptions.some((c) => c.id === id),
  )
  const minPrice = digitsParam(params, 'minPrice')
  const maxPrice = digitsParam(params, 'maxPrice')
  // The two years describe exchange ads only
  const requestYear =
    type === 'EXCHANGE' ? yearParam(params, 'requestYear') : undefined
  const requiredYear =
    type === 'EXCHANGE' ? yearParam(params, 'requiredYear') : undefined
  const sort: SortId =
    SORTS.find((option) => option.id === param(params, 'sort'))?.id ?? 'DEFAULT'
  const requestedView = param(params, 'view')
  const view: ViewId =
    requestedView === 'list' || requestedView === 'map'
      ? requestedView
      : 'cards'
  const page = pageParam(params)

  const filters = {
    type,
    governorateId: governorateIds.join(',') || undefined,
    areaId: areaIds.join(',') || undefined,
    category: categories.join(',') || undefined,
    minPrice,
    maxPrice,
    requestYear,
    requiredYear,
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
    requestYear: requestYear ? Number(requestYear) : undefined,
    requiredYear: requiredYear ? Number(requiredYear) : undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  })

  const typeTab = LISTING_TYPES.find((t) => t.id === type)?.tab
  const heading = typeTab ? `عقارات ${typeTab}` : 'كل العقارات'

  // One chip per applied filter; its link is this search without it
  const hrefWithout = (changes: Partial<typeof filters>) =>
    hrefWith('/properties', { ...filters, ...display, ...changes })
  const chips: FilterChip[] = [
    ...governorateIds.map((id) => ({
      label: GOVERNORATES.find((g) => g.id === id)!.label,
      href: hrefWithout({
        governorateId: without(governorateIds, id),
        // Its areas go with it
        areaId:
          areaIds
            .filter((areaId) => !(AREAS[id] ?? []).some((a) => a.id === areaId))
            .join(',') || undefined,
      }),
    })),
    ...areaIds.map((id) => ({
      label: areaOptions.find((area) => area.id === id)!.label,
      href: hrefWithout({ areaId: without(areaIds, id) }),
    })),
    ...categories.map((id) => ({
      label: categoryOptions.find((c) => c.id === id)!.label,
      href: hrefWithout({ category: without(categories, id) }),
    })),
    ...(requestYear
      ? [
          {
            label: `طلب ${requestYear}`,
            href: hrefWithout({ requestYear: undefined }),
          },
        ]
      : []),
    ...(requiredYear
      ? [
          {
            label: `المطلوبة ${requiredYear}`,
            href: hrefWithout({ requiredYear: undefined }),
          },
        ]
      : []),
    ...(minPrice
      ? [
          {
            label: `من ${formatNumber(Number(minPrice))} د.ك`,
            href: hrefWithout({ minPrice: undefined }),
          },
        ]
      : []),
    ...(maxPrice
      ? [
          {
            label: `إلى ${formatNumber(Number(maxPrice))} د.ك`,
            href: hrefWithout({ maxPrice: undefined }),
          },
        ]
      : []),
  ]

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
            requestYear,
            requiredYear,
          }}
          sort={display.sort}
          view={display.view}
        />

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <h2 className="text-[26px] leading-normal font-bold tracking-[-0.52px] text-ink">
            {heading}
          </h2>
          <div className="h-px w-full bg-line" />
          <PropertiesToolbar filters={filters} sort={sort} view={view} />
          <ActiveFilters
            chips={chips}
            // The listing type stays: it is the page's heading, not a chip
            clearHref={hrefWith('/properties', { type, ...display })}
            countLabel={`${formatNumber(meta.total)} عقار`}
          />

          {view === 'map' ? (
            <PropertiesMap
              filters={{
                type,
                governorateIds,
                areaIds,
                categories,
                minPrice,
                maxPrice,
                requestYear,
                requiredYear,
              }}
              closeHref={hrefWith('/properties', {
                ...filters,
                sort: display.sort,
              })}
            />
          ) : data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  layout={view === 'list' ? 'compact' : 'card'}
                />
              ))}
            </div>
          ) : (
            <EmptyResults message="لا توجد عقارات مطابقة لبحثك. جرّب تغيير خيارات التصفية." />
          )}

          {view !== 'map' && (
            <Pagination
              current={meta.current || page}
              totalPages={meta.totalPages}
              hrefFor={(target) =>
                hrefWith('/properties', {
                  ...filters,
                  ...display,
                  page: target,
                })
              }
            />
          )}
        </div>
      </div>
    </>
  )
}
