import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import PropertySkeleton from '@/core/components/skeletons/PropertySkeleton';
import { HomeFeedResponse } from '@/types/feed';

import ExchangeProperties from './sliders/ExchangeProperties';
import RentProperties from './sliders/RentProperties';
import SaleProperties from './sliders/SaleProperties';
import ServiceCompanies from './sliders/ServiceCompanies';

interface HomeAllProps {
  feedData: HomeFeedResponse | null;
  isLoading: boolean;
}

export default function HomeAll({ feedData, isLoading }: HomeAllProps) {

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {[1, 2, 3, 4].map((key) => (
          <View key={key} className="mb-6">
            <View className="mb-3 mt-1 flex-row items-center justify-between px-5">
              {/* Title Placeholder */}
              <View className="h-6 w-28 rounded-md bg-slate-200" />
              {/* Show More Placeholder */}
              <View className="h-4 w-16 rounded-md bg-slate-100" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <PropertySkeleton />
              <PropertySkeleton />
            </ScrollView>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {/* --- Section: عقارات للبيع (Properties for Sale) --- */}
      <SaleProperties initialData={feedData?.sale || []} />

      {/* --- Section: عقارات للايجار (Properties for Rent) --- */}
      <RentProperties initialData={feedData?.rent || []} />

      {/* --- Section: عقارات للبدل (Properties for Exchange) --- */}
      <ExchangeProperties initialData={feedData?.exchange || []} />

      {/* --- Section: شركات الخدمات (Service Companies) --- */}
      <ServiceCompanies initialData={feedData?.companies || []} />
    </View>
  );
}
