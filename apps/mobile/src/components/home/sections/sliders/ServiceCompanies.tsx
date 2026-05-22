import React from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CompanyCard from '@/core/components/CompanyCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-1 flex-row items-center justify-between px-5">
    <Text className="font-cairo-bold text-lg text-[#111111]">{title}</Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text className="font-cairo-semibold text-sm text-[#15304D]">
        عرض الكل
      </Text>
    </TouchableOpacity>
  </View>
);

import { COMPANIES_DATA } from '@/assets/mock/companiesData';
export { COMPANIES_DATA };

interface ServiceCompaniesProps {
  activeFilter?:
    | 'all'
    | 'finishing'
    | 'transport'
    | 'building'
    | 'decorations'
    | 'interior_design'
    | 'other';
}

export default function ServiceCompanies({
  activeFilter = 'all',
}: ServiceCompaniesProps) {
  const filteredCompanies =
    activeFilter === 'all'
      ? COMPANIES_DATA
      : COMPANIES_DATA.filter((company) =>
          company.filterTags.includes(activeFilter),
        );

  return (
    <View>
      <SectionHeader title="شركات الخدمات" />
      {filteredCompanies.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {filteredCompanies.map((company, index) => (
            <View
              key={company.id}
              className={index < filteredCompanies.length - 1 ? 'mr-4' : ''}
            >
              <CompanyCard
                id={company.id}
                name={company.name}
                category={company.category}
                rating={company.rating}
                projectsCount={company.projectsCount}
                serviceArea={company.serviceArea}
                logoUrl={company.logoUrl}
                isVerified={company.isVerified}
                isFavorite={company.isFavorite}
                cardWidth={HORIZONTAL_CARD_WIDTH}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
            لا توجد شركات مطابقة لهذا التصنيف حالياً.
          </Text>
        </View>
      )}
    </View>
  );
}
