'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import {
  ChipPanel,
  FilterField,
  PricePanel,
  summarize,
  type Option,
} from '@/components/home/FilterPanels'
import {
  COMPANY_CATEGORIES,
  COMPANY_SPECIALTIES,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
} from '@/lib/categories'
import { formatNumber } from '@/lib/format'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import type { ListingType } from '@/lib/types'

export interface SearchFilterValues {
  type?: ListingType
  governorateIds?: string[]
  areaIds?: string[]
  categories?: string[]
  minPrice?: string
  maxPrice?: string
}

interface SearchFilterProps {
  // Pre-fills the fields on the listing page
  initial?: SearchFilterValues
  // The hero version also searches service companies and offices
  withServices?: boolean
}

const asOptions = (names: string[]): Option[] =>
  names.map((name) => ({ id: name, label: name }))
const SPECIALTY_OPTIONS = asOptions(COMPANY_SPECIALTIES)
const SERVICE_TYPE_OPTIONS = asOptions(COMPANY_CATEGORIES)

type ServiceKind = 'companies' | 'offices'
const SERVICE_KINDS: { id: ServiceKind; label: string }[] = [
  { id: 'companies', label: 'شركات' },
  { id: 'offices', label: 'مكاتب عقارية' },
]

/** The tab strip above the fields: بيع / ايجار / بدل, or شركات / مكاتب عقارية. */
function Tabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex items-baseline gap-2.5 border-b border-[#EBECEE] px-4 lg:px-8"
    >
      {options.map((option) => {
        const selected = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className="flex h-11.5 min-w-22.5 flex-col items-center justify-between px-2.5 pt-3.5"
          >
            <span
              className={`text-base whitespace-nowrap ${selected ? 'font-bold text-brand' : 'font-medium text-muted'}`}
            >
              {option.label}
            </span>
            <span
              className={`h-0.5 w-full rounded-t-md ${selected ? 'bg-brand' : 'bg-transparent'}`}
            />
          </button>
        )
      })}
    </div>
  )
}

function priceSummary(min: string, max: string): string {
  if (min && max)
    return `${formatNumber(Number(min))} - ${formatNumber(Number(max))}`
  if (min) return `من ${formatNumber(Number(min))}`
  if (max) return `حتى ${formatNumber(Number(max))}`
  return ''
}

/**
 * The search box. For ads: listing type tabs over governorate, area, type
 * and price. For services: companies or offices by location, specialty and
 * service type. Each field opens a panel; submitting opens the matching
 * list with the choices in the URL.
 */
export default function SearchFilter({
  initial = {},
  withServices = false,
}: SearchFilterProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'properties' | 'services'>('properties')

  const [type, setType] = useState<ListingType>(initial.type ?? 'SALE')
  const [governorateIds, setGovernorateIds] = useState(
    initial.governorateIds ?? [],
  )
  const [areaIds, setAreaIds] = useState(initial.areaIds ?? [])
  const [categories, setCategories] = useState(initial.categories ?? [])
  const [price, setPrice] = useState({
    min: initial.minPrice ?? '',
    max: initial.maxPrice ?? '',
  })

  const [serviceKind, setServiceKind] = useState<ServiceKind>('companies')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])

  // The areas of every picked governorate
  const areaOptions = useMemo(
    () => governorateIds.flatMap((id) => AREAS[id] ?? []),
    [governorateIds],
  )

  const changeGovernorates = (next: string[]) => {
    setGovernorateIds(next)
    // Drop areas whose governorate is no longer picked
    const stillOffered = new Set(
      next.flatMap((id) => (AREAS[id] ?? []).map((a) => a.id)),
    )
    setAreaIds((current) => current.filter((id) => stillOffered.has(id)))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()

    if (mode === 'properties') {
      params.set('type', type)
      if (governorateIds.length)
        params.set('governorateId', governorateIds.join(','))
      if (areaIds.length) params.set('areaId', areaIds.join(','))
      if (categories.length) params.set('category', categories.join(','))
      if (price.min) params.set('minPrice', price.min)
      if (price.max) params.set('maxPrice', price.max)
      router.push(`/properties?${params}`)
      return
    }

    // Companies and offices are located by name: the areas if any were
    // picked, otherwise the governorates
    const places = (areaIds.length ? areaOptions : GOVERNORATES)
      .filter((place) =>
        (areaIds.length ? areaIds : governorateIds).includes(place.id),
      )
      .map((place) => place.label)
    if (places.length) params.set('location', places.join(','))
    if (serviceKind === 'companies') {
      if (specialties.length) params.set('specialty', specialties.join(','))
      if (serviceTypes.length) params.set('category', serviceTypes.join(','))
    }
    const path = serviceKind === 'companies' ? '/companies' : '/offices'
    router.push(params.size ? `${path}?${params}` : path)
  }

  const locationFields = (
    <>
      <FilterField
        label="المحافظة"
        summary={summarize('المحافظة', governorateIds, GOVERNORATES)}
      >
        <ChipPanel
          options={GOVERNORATES}
          selected={governorateIds}
          onChange={changeGovernorates}
        />
      </FilterField>
      <FilterField
        label="المنطقة"
        summary={summarize('المنطقة', areaIds, areaOptions)}
      >
        <ChipPanel
          options={areaOptions}
          selected={areaIds}
          onChange={setAreaIds}
          emptyText="اختر المحافظة أولاً لعرض مناطقها."
        />
      </FilterField>
    </>
  )

  return (
    <form onSubmit={submit} className="flex w-full flex-col items-center gap-5">
      {withServices && (
        <div
          role="tablist"
          aria-label="نوع البحث"
          className="flex items-center gap-3 rounded-4xl bg-white px-3 py-2"
        >
          {(
            [
              ['properties', 'عقارات'],
              ['services', 'خدمات'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`flex h-11 w-27.75 items-center justify-center rounded-4xl text-base ${
                mode === id
                  ? 'bg-[#EFF1F3] font-bold text-brand'
                  : 'font-medium text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="w-full max-w-259.75 rounded-[20px] bg-white pt-4 shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
        {mode === 'properties' ? (
          <Tabs
            label="نوع الإعلان"
            options={LISTING_TYPES}
            value={type}
            onChange={setType}
          />
        ) : (
          <Tabs
            label="نوع مقدم الخدمة"
            options={SERVICE_KINDS}
            value={serviceKind}
            onChange={setServiceKind}
          />
        )}

        <div className="flex flex-col gap-3 px-4 py-5 lg:flex-row lg:items-center lg:gap-5 lg:px-8 lg:py-6">
          <div className="grid flex-1 grid-cols-2 gap-y-2 lg:flex">
            {locationFields}
            {mode === 'properties' ? (
              <>
                <FilterField
                  label="النوع"
                  summary={summarize('النوع', categories, PROPERTY_CATEGORIES)}
                >
                  <ChipPanel
                    options={PROPERTY_CATEGORIES}
                    selected={categories}
                    onChange={setCategories}
                  />
                </FilterField>
                <FilterField
                  label="السعر"
                  summary={priceSummary(price.min, price.max)}
                >
                  <PricePanel
                    min={price.min}
                    max={price.max}
                    onChange={setPrice}
                  />
                </FilterField>
              </>
            ) : (
              serviceKind === 'companies' && (
                <>
                  <FilterField
                    label="التخصص"
                    summary={summarize(
                      'التخصص',
                      specialties,
                      SPECIALTY_OPTIONS,
                    )}
                  >
                    <ChipPanel
                      options={SPECIALTY_OPTIONS}
                      selected={specialties}
                      onChange={setSpecialties}
                    />
                  </FilterField>
                  <FilterField
                    label="نوع الخدمة"
                    summary={summarize(
                      'نوع الخدمة',
                      serviceTypes,
                      SERVICE_TYPE_OPTIONS,
                    )}
                  >
                    <ChipPanel
                      options={SERVICE_TYPE_OPTIONS}
                      selected={serviceTypes}
                      onChange={setServiceTypes}
                    />
                  </FilterField>
                </>
              )
            )}
          </div>

          <button
            type="submit"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-4.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            <Image src="/landing/search.svg" alt="" width={16} height={16} />
            تصفية البحث
          </button>
        </div>
      </div>
    </form>
  )
}
