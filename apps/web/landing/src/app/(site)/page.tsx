import CompaniesSection from '@/components/home/CompaniesSection'
import Hero from '@/components/home/Hero'
import JoinBanner from '@/components/home/JoinBanner'
import LatestProperties from '@/components/home/LatestProperties'
import ListWithUsBanner from '@/components/home/ListWithUsBanner'
import MobileAppPromo from '@/components/home/MobileAppPromo'
import NextSteps from '@/components/home/NextSteps'
import OfficesSection from '@/components/home/OfficesSection'
import PropertyTabsSection from '@/components/home/PropertyTabsSection'
import { getCompanies, getOffices, getProperties } from '@/lib/data'

// How many ads each row holds before "عرض الكل"
const ROW_SIZE = 8

export default async function HomePage() {
  const [sale, rent, exchange, latest, companies, offices] = await Promise.all([
    getProperties({ type: 'SALE', limit: ROW_SIZE }),
    getProperties({ type: 'RENT', limit: ROW_SIZE }),
    getProperties({ type: 'EXCHANGE', limit: ROW_SIZE }),
    getProperties({ sort: 'NEWEST', limit: ROW_SIZE }),
    getCompanies({ limit: 6 }),
    getOffices({ limit: 8 }),
  ])

  return (
    <>
      <Hero />
      <div className="flex flex-col gap-20 py-16 md:gap-30 md:py-30">
        <NextSteps />
        <PropertyTabsSection
          byType={{ SALE: sale.data, RENT: rent.data, EXCHANGE: exchange.data }}
        />
        <LatestProperties properties={latest.data} />
        <ListWithUsBanner />
        <CompaniesSection initial={companies.data} />
        <OfficesSection offices={offices.data} />
        <MobileAppPromo />
      </div>
      <JoinBanner />
    </>
  )
}
