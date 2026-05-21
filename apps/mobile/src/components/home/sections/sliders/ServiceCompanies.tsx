import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import CompanyCard from '@/core/components/CompanyCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-6 flex-row items-center justify-between px-5">
    <TouchableOpacity activeOpacity={0.7}>
      <Text className="font-cairo-bold text-sm text-[#15304D]">عرض الكل</Text>
    </TouchableOpacity>
    <Text className="font-cairo-bold text-lg text-[#111111]">{title}</Text>
  </View>
);

const COMPANIES_DATA = [
  {
    id: '1',
    name: 'شركة البناء المتقن',
    category: 'تشطيب • تصميم داخلي • تنفيذ',
    filterTags: ['finishing', 'building'],
    rating: 3.5,
    projectsCount: '+65',
    serviceArea: 'يخدم جميع المناطق',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'مؤسسة المعمار الحديث',
    category: 'مقاولات عامة • بناء هيكل',
    filterTags: ['building'],
    rating: 4.8,
    projectsCount: '+120',
    serviceArea: 'محافظة العاصمة وحولي',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    isFavorite: true,
  },
];

interface ServiceCompaniesProps {
  activeFilter?: 'all' | 'finishing' | 'transport' | 'building' | 'other';
}

export default function ServiceCompanies({ activeFilter = 'all' }: ServiceCompaniesProps) {
  const filteredCompanies = activeFilter === 'all'
    ? COMPANIES_DATA
    : COMPANIES_DATA.filter((company) => company.filterTags.includes(activeFilter));

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
