import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import CompanyListCard from '@/features/individual/components/companies/CompanyListCard';
import OfficeListCard from '@/features/individual/components/offices/OfficeListCard';
import { feedService } from '@/features/individual/services/feed.service';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import GoldSegment, {
  GoldSegmentOption,
} from '@/shared/components/ui/GoldSegment';
import { openChatWith } from '@/shared/utils/openChat';

import OfficeSectionHeader from './OfficeSectionHeader';

type Sector = 'offices' | 'companies';

const TABS: GoldSegmentOption<Sector>[] = [
  { id: 'offices', label: 'مكاتب عقارية' },
  { id: 'companies', label: 'شركات' },
];

// How many cards the home row shows before «عرض الكل»
const ROW_LIMIT = 6;
const CARD_WIDTH = 300;

interface OfficeBusinessSectorsProps {
  // The signed-in office, left out of its own directory row
  ownIdentityId?: string;
}

// قطاعات الأعمال (Figma 9797:21614 / 4494:140590): offices and companies
export default function OfficeBusinessSectors({
  ownIdentityId,
}: OfficeBusinessSectorsProps) {
  const router = useRouter();
  const [sector, setSector] = useState<Sector>('offices');

  const offices = useQuery({
    queryKey: ['officeHome', 'sectors', 'offices'],
    queryFn: () => feedService.getOffices(1, ROW_LIMIT + 1),
    enabled: sector === 'offices',
  });
  const companies = useQuery({
    queryKey: ['officeHome', 'sectors', 'companies'],
    queryFn: () => feedService.getCompanies(undefined, 1, ROW_LIMIT, undefined, 'RATING_DESC'),
    enabled: sector === 'companies',
  });

  const active = sector === 'offices' ? offices : companies;
  const officeItems = (offices.data?.data ?? [])
    .filter((o) => o.id !== ownIdentityId)
    .slice(0, ROW_LIMIT);
  const companyItems = companies.data?.data ?? [];
  const isEmpty =
    sector === 'offices' ? officeItems.length === 0 : companyItems.length === 0;

  return (
    <View className="mt-6">
      <ContentContainer className="px-4">
        {/* No «عرض الكل»: the full directories live in the individual
            tabs, which an office account doesn't navigate into */}
        <OfficeSectionHeader title="قطاعات الأعمال" />
        <View className="mb-2.5 h-[42px] flex-row">
          <GoldSegment
            testID="office-home-sectors"
            options={TABS}
            value={sector}
            onChange={setSector}
          />
        </View>
      </ContentContainer>

      {active.isLoading ? (
        <ActivityIndicator className="py-8" color="#15304D" />
      ) : isEmpty ? (
        <Text
          className="py-6 text-center font-cairo-medium text-[13px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {sector === 'offices' ? 'لا توجد مكاتب عقارية حالياً' : 'لا توجد شركات حالياً'}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 12,
            flexDirection: 'row-reverse',
          }}
        >
          {sector === 'offices'
            ? officeItems.map((office) => (
                <View key={office.id} style={{ width: CARD_WIDTH }}>
                  <OfficeListCard
                    id={office.id}
                    name={office.name}
                    rating={office.rating}
                    reviewsCount={office.reviewsCount}
                    location={office.location}
                    logoUrl={office.logoUrl}
                    isVerified={office.isVerified}
                    propertiesCount={office.propertiesCount}
                    listingTypes={office.listingTypes}
                    servicesCount={office.servicesCount}
                    phone={office.phone}
                    whatsapp={office.whatsapp}
                    onPress={() => router.push(`/office/${office.id}` as any)}
                  />
                </View>
              ))
            : companyItems.map((company) => (
                <View key={company.id} style={{ width: CARD_WIDTH }}>
                  <CompanyListCard
                    id={company.id}
                    name={company.name}
                    category={company.category}
                    rating={company.rating}
                    reviewsCount={company.reviewsCount}
                    projectsCount={company.projectsCount}
                    lastActivityAt={company.lastActivityAt}
                    servicesCount={company.servicesCount ?? 0}
                    logoUrl={company.logoUrl}
                    isVerified={company.isVerified}
                    onPress={() => router.push(`/company/${company.id}` as any)}
                    // The quote request starts from the company's profile
                    onQuotePress={() =>
                      router.push(`/company/${company.id}` as any)
                    }
                    onChatPress={() =>
                      openChatWith(router, { recipientId: company.id })
                    }
                  />
                </View>
              ))}
        </ScrollView>
      )}
    </View>
  );
}
