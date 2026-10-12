import OfficeCard from '@/components/cards/OfficeCard'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import type { Office } from '@/lib/types'

/** "المكاتب العقارية": two rows of four offices. */
export default function OfficesSection({ offices }: { offices: Office[] }) {
  if (offices.length === 0) return null

  return (
    <Section className="flex flex-col gap-10">
      <SectionHeader title="المكاتب العقارية" allHref="/offices" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {offices.map((office) => (
          <OfficeCard key={office.id} office={office} />
        ))}
      </div>
    </Section>
  )
}
