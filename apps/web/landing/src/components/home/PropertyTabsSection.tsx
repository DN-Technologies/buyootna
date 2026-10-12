'use client'

import { useState } from 'react'

import PropertyCard from '@/components/cards/PropertyCard'
import Carousel, { CarouselItem } from '@/components/ui/Carousel'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import { LISTING_TYPES } from '@/lib/categories'
import type { ListingType, Property } from '@/lib/types'

// Four cards across on a desktop, fewer as the screen narrows
export const PROPERTY_SLIDE_CLASS =
  'w-[82%] sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-60px)/4)]'

interface PropertyTabsSectionProps {
  // The ads of each listing type, fetched on the server
  byType: Record<ListingType, Property[]>
}

/** "استكشف عقارات": للبيع / للايجار / للبدل tabs over a row of ads. */
export default function PropertyTabsSection({
  byType,
}: PropertyTabsSectionProps) {
  const available = LISTING_TYPES.filter((type) => byType[type.id].length > 0)
  const [selected, setSelected] = useState<ListingType | undefined>(
    available[0]?.id,
  )
  if (!selected) return null

  return (
    <Section className="flex flex-col gap-4">
      <SectionHeader
        title="استكشف عقارات"
        allHref={`/properties?type=${selected}`}
      />

      <div className="flex flex-col gap-5">
        <div
          role="tablist"
          aria-label="نوع الإعلان"
          className="flex gap-2.5 border-b border-line"
        >
          {available.map((type) => {
            const active = type.id === selected
            return (
              <button
                key={type.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(type.id)}
                className="flex h-11.5 w-22.5 flex-col items-center justify-between pt-2.5"
              >
                <span
                  className={`text-base ${active ? 'font-bold text-brand' : 'font-medium text-muted'}`}
                >
                  {type.tab}
                </span>
                <span
                  className={`h-0.75 w-full rounded-t-md ${active ? 'bg-brand' : 'bg-transparent'}`}
                />
              </button>
            )
          })}
        </div>

        {/* A new key resets the row's scroll position when the tab changes */}
        <Carousel key={selected} label="استكشف عقارات">
          {byType[selected].map((property) => (
            <CarouselItem key={property.id} className={PROPERTY_SLIDE_CLASS}>
              <PropertyCard property={property} />
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </Section>
  )
}
