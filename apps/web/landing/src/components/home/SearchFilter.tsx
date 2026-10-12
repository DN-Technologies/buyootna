'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  COMPANY_CATEGORIES,
  LISTING_TYPES,
  PRICE_CEILINGS,
  PROPERTY_CATEGORIES,
} from '@/lib/categories'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import type { ListingType } from '@/lib/types'

export interface SearchFilterValues {
  type?: ListingType
  governorateId?: string
  areaId?: string
  category?: string
  maxPrice?: string
}

interface SearchFilterProps {
  // Pre-fills the fields on the listing page
  initial?: SearchFilterValues
  // The hero version also offers searching for service companies
  withServices?: boolean
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
  disabled?: boolean
}

/** A borderless dropdown in the filter bar, with the round chevron. */
function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: SelectFieldProps) {
  return (
    <label className="relative flex h-11.5 min-w-0 flex-1 items-center justify-between gap-2 border-line px-4 lg:w-47.5 lg:flex-none lg:border-r lg:first:border-r-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent pr-4 pl-12 text-base font-semibold outline-none disabled:cursor-not-allowed ${
          value ? 'text-ink' : 'text-muted'
        }`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none mr-auto flex h-8 w-8 items-center justify-center rounded-full bg-surface">
        <Image
          src="/landing/select-chevron.svg"
          alt=""
          width={18}
          height={18}
        />
      </span>
    </label>
  )
}

/**
 * The search box: listing type tabs over governorate, area, category and
 * price. Submitting opens the matching list with the choices in the URL.
 */
export default function SearchFilter({
  initial = {},
  withServices = false,
}: SearchFilterProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'properties' | 'services'>('properties')
  const [type, setType] = useState<ListingType>(initial.type ?? 'SALE')
  const [governorateId, setGovernorateId] = useState(
    initial.governorateId ?? '',
  )
  const [areaId, setAreaId] = useState(initial.areaId ?? '')
  const [category, setCategory] = useState(initial.category ?? '')
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? '')
  const [serviceCategory, setServiceCategory] = useState('')

  const areas = governorateId ? (AREAS[governorateId] ?? []) : []

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (mode === 'services') {
      if (serviceCategory) params.set('category', serviceCategory)
      router.push(`/companies${params.size ? `?${params}` : ''}`)
      return
    }
    params.set('type', type)
    if (governorateId) params.set('governorateId', governorateId)
    if (areaId) params.set('areaId', areaId)
    if (category) params.set('category', category)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/properties?${params}`)
  }

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
        {mode === 'properties' && (
          <div
            role="tablist"
            aria-label="نوع الإعلان"
            className="flex items-baseline gap-2.5 border-b border-[#EBECEE] px-4 lg:px-8"
          >
            {LISTING_TYPES.map((option) => {
              const selected = type === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setType(option.id)}
                  className="flex h-11.5 w-22.5 flex-col items-center justify-between pt-3.5"
                >
                  <span
                    className={`text-base ${selected ? 'font-bold text-brand' : 'font-medium text-muted'}`}
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
        )}

        <div className="flex flex-col gap-3 px-4 py-5 lg:flex-row lg:items-center lg:gap-5 lg:px-8 lg:py-6">
          {mode === 'properties' ? (
            <div className="grid flex-1 grid-cols-2 gap-y-2 lg:flex">
              <SelectField
                label="المحافظة"
                value={governorateId}
                onChange={(value) => {
                  setGovernorateId(value)
                  setAreaId('')
                }}
                options={GOVERNORATES}
              />
              <SelectField
                label="المنطقة"
                value={areaId}
                onChange={setAreaId}
                options={areas}
                disabled={!governorateId}
              />
              <SelectField
                label="النوع"
                value={category}
                onChange={setCategory}
                options={PROPERTY_CATEGORIES}
              />
              <SelectField
                label="السعر"
                value={maxPrice}
                onChange={setMaxPrice}
                options={PRICE_CEILINGS}
              />
            </div>
          ) : (
            <div className="flex flex-1">
              <SelectField
                label="نوع الخدمة"
                value={serviceCategory}
                onChange={setServiceCategory}
                options={COMPANY_CATEGORIES.map((name) => ({
                  id: name,
                  label: name,
                }))}
              />
            </div>
          )}

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
