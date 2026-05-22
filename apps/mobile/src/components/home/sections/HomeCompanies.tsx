import React from 'react';
import { Text, View } from 'react-native';

import CompanyCard from '@/core/components/CompanyCard';

import { COMPANIES_DATA } from './sliders/ServiceCompanies';

interface HomeCompaniesProps {
  activeFilter?:
    | 'all'
    | 'finishing'
    | 'transport'
    | 'building'
    | 'decorations'
    | 'interior_design'
    | 'other';
}

export default function HomeCompanies({ activeFilter = 'all' }: HomeCompaniesProps) {
  const filteredCompanies =
    activeFilter === 'all'
      ? COMPANIES_DATA
      : COMPANIES_DATA.filter((company) =>
          company.filterTags.includes(activeFilter)
        );

  return (
    <View className="px-5">
      {filteredCompanies.length > 0 ? (
        filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            id={company.id}
            name={company.name}
            category={company.category}
            rating={company.rating}
            projectsCount={company.projectsCount}
            serviceArea={company.serviceArea}
            logoUrl={company.logoUrl}
            isVerified={company.isVerified}
            isFavorite={company.isFavorite}
            cardWidth="100%"
          />
        ))
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
