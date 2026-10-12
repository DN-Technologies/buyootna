'use client'

import { Check } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'

import { LISTING_TYPES, PROPERTY_CATEGORIES } from '@/lib/categories'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import { hrefWith } from '@/lib/searchParams'
import type { ListingType } from '@/lib/types'

export interface PropertyFilterValues {
  type?: ListingType
  governorateIds: string[]
  areaIds: string[]
  categories: string[]
  minPrice?: string
  maxPrice?: string
}

interface PropertyFiltersProps {
  values: PropertyFilterValues
  // Kept as they are when a filter changes
  sort?: string
  view?: string
}

// The sidebar's wording for the listing types
const TYPE_LABELS: Record<ListingType, string> = {
  SALE: 'البيع',
  RENT: 'الايجار',
  EXCHANGE: 'البدل',
}

/** A titled group of options that folds away. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <section className="flex flex-col gap-1 border-t-[1.4px] border-line pt-5 first:border-t-0 first:pt-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-full items-center justify-between gap-3 text-base leading-[1.2] font-semibold text-ink"
      >
        {title}
        <span className="flex h-6 w-6 items-center justify-center">
          <Image
            src="/landing/filter-chevron.svg"
            alt=""
            width={18}
            height={18}
            className={`transition ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open && children}
    </section>
  )
}

function Option({
  label,
  checked,
  radio = false,
  onToggle,
}: {
  label: string
  checked: boolean
  radio?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role={radio ? 'radio' : 'checkbox'}
      aria-checked={checked}
      onClick={onToggle}
      className="flex h-10 w-full items-center gap-1.5 rounded-2xl px-1 text-[15px] font-medium tracking-[-0.408px] text-[#363636] transition hover:bg-surface"
    >
      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center">
        {radio ? (
          checked ? (
            <span className="flex h-3.75 w-3.75 items-center justify-center rounded-full border-[1.5px] border-brand">
              <span className="h-1.75 w-1.75 rounded-full bg-brand" />
            </span>
          ) : (
            <Image
              src="/landing/filter-radio.svg"
              alt=""
              width={18}
              height={18}
            />
          )
        ) : (
          <span
            className={`flex h-[13.5px] w-[13.5px] items-center justify-center rounded-[2.7px] border-[0.675px] ${
              checked ? 'border-brand bg-brand' : 'border-[#D7D7D7]'
            }`}
          >
            {checked && (
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            )}
          </span>
        )}
      </span>
      {label}
    </button>
  )
}

function PriceInput({
  label,
  placeholder,
  value,
  onCommit,
}: {
  label: string
  placeholder: string
  value: string
  onCommit: (value: string) => void
}) {
  const [text, setText] = useState(value)
  return (
    <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line px-3 focus-within:border-brand">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value.replace(/[^\d]/g, ''))}
        onBlur={() => text !== value && onCommit(text)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onCommit(text)
        }}
        className="w-full min-w-0 flex-1 bg-transparent text-sm tracking-[-0.408px] text-ink outline-none placeholder:text-[#989898]"
      />
      <Image src="/landing/filter-caret.svg" alt="" width={16} height={16} />
    </label>
  )
}

const toggled = (list: string[], id: string) =>
  list.includes(id) ? list.filter((value) => value !== id) : [...list, id]

/**
 * "التصفية حسب": the listing page's filters. Every change is applied at once
 * by moving to the URL that carries it, so the results stay linkable.
 */
export default function PropertyFilters({
  values,
  sort,
  view,
}: PropertyFiltersProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // On small screens the panel starts folded under a button
  const [shown, setShown] = useState(false)

  const apply = (next: PropertyFilterValues) => {
    // Areas only count while their governorate is picked
    const offered = new Set(
      next.governorateIds.flatMap((id) => (AREAS[id] ?? []).map((a) => a.id)),
    )
    const href = hrefWith('/properties', {
      type: next.type,
      governorateId: next.governorateIds.join(','),
      areaId: next.areaIds.filter((id) => offered.has(id)).join(','),
      category: next.categories.join(','),
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
      sort,
      view,
    })
    startTransition(() => router.push(href, { scroll: false }))
  }

  const areaOptions = values.governorateIds.flatMap((id) => AREAS[id] ?? [])
  const activeCount =
    (values.type ? 1 : 0) +
    values.governorateIds.length +
    values.areaIds.length +
    values.categories.length +
    (values.minPrice ? 1 : 0) +
    (values.maxPrice ? 1 : 0)

  return (
    <aside
      aria-label="التصفية"
      className={`w-full shrink-0 rounded-lg border border-line bg-white px-5 py-4 transition lg:w-73.75 ${
        pending ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={shown}
          onClick={() => setShown((value) => !value)}
          className="flex-1 text-right text-base leading-[1.2] font-semibold text-ink lg:pointer-events-none"
        >
          التصفية حسب
          {activeCount > 0 && (
            <span className="mr-2 text-sm font-medium text-muted lg:hidden">
              ({activeCount})
            </span>
          )}
        </button>
        <button
          type="button"
          disabled={activeCount === 0}
          onClick={() =>
            apply({ governorateIds: [], areaIds: [], categories: [] })
          }
          className="flex h-8 items-center rounded-3xl px-3 text-sm font-bold text-brand disabled:opacity-40"
        >
          مسح الكل
        </button>
      </div>

      <div
        className={`mt-2 flex-col gap-5 border-t-[1.4px] border-line pt-5 lg:flex ${
          shown ? 'flex' : 'hidden'
        }`}
      >
        <Section title="النوع">
          <div role="radiogroup" aria-label="النوع">
            {LISTING_TYPES.map((type) => (
              <Option
                key={type.id}
                radio
                label={TYPE_LABELS[type.id]}
                checked={values.type === type.id}
                onToggle={() =>
                  apply({
                    ...values,
                    type: values.type === type.id ? undefined : type.id,
                  })
                }
              />
            ))}
          </div>
        </Section>

        <Section title="المحافظة">
          {GOVERNORATES.map((governorate) => (
            <Option
              key={governorate.id}
              label={governorate.label}
              checked={values.governorateIds.includes(governorate.id)}
              onToggle={() =>
                apply({
                  ...values,
                  governorateIds: toggled(
                    values.governorateIds,
                    governorate.id,
                  ),
                })
              }
            />
          ))}
        </Section>

        <Section title="المنطقة">
          {areaOptions.length > 0 ? (
            <div className="panel-scroll max-h-60 overflow-y-auto">
              {areaOptions.map((area) => (
                <Option
                  key={area.id}
                  label={area.label}
                  checked={values.areaIds.includes(area.id)}
                  onToggle={() =>
                    apply({
                      ...values,
                      areaIds: toggled(values.areaIds, area.id),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="px-1 py-2 text-sm font-medium text-muted">
              اختر المحافظة أولاً لعرض مناطقها.
            </p>
          )}
        </Section>

        <Section title="الفئة">
          {PROPERTY_CATEGORIES.map((category) => (
            <Option
              key={category.id}
              label={category.label}
              checked={values.categories.includes(category.id)}
              onToggle={() =>
                apply({
                  ...values,
                  categories: toggled(values.categories, category.id),
                })
              }
            />
          ))}
        </Section>

        <Section title="السعر">
          {/* Remount with the URL so a cleared filter empties the boxes */}
          <div
            key={`${values.minPrice ?? ''}-${values.maxPrice ?? ''}`}
            className="flex items-center gap-2 pt-1"
          >
            <PriceInput
              label="السعر من"
              placeholder="من"
              value={values.minPrice ?? ''}
              onCommit={(minPrice) =>
                apply({ ...values, minPrice: minPrice || undefined })
              }
            />
            <PriceInput
              label="السعر إلى"
              placeholder="إلى"
              value={values.maxPrice ?? ''}
              onCommit={(maxPrice) =>
                apply({ ...values, maxPrice: maxPrice || undefined })
              }
            />
          </div>
        </Section>
      </div>
    </aside>
  )
}
