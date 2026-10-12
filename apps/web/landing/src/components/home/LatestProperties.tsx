import PropertyCard from '@/components/cards/PropertyCard'
import { PROPERTY_SLIDE_CLASS } from '@/components/home/PropertyTabsSection'
import Carousel, { CarouselItem } from '@/components/ui/Carousel'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Property } from '@/lib/types'

/** "احدث العقارات": the most recently published ads. */
export default function LatestProperties({
  properties,
}: {
  properties: Property[]
}) {
  if (properties.length === 0) return null

  return (
    <Section className="flex flex-col gap-10">
      <SectionHeader title="احدث العقارات" />
      <Carousel label="احدث العقارات">
        {properties.map((property) => (
          <CarouselItem key={property.id} className={PROPERTY_SLIDE_CLASS}>
            <PropertyCard property={property} />
          </CarouselItem>
        ))}
      </Carousel>
    </Section>
  )
}
