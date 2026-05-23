import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { feedService } from '@/core/api/feed.service';
import PropertySkeleton from '@/core/components/skeletons/PropertySkeleton';
import { HomeFeedResponse } from '@/types/feed';

import ExchangeProperties from './sliders/ExchangeProperties';
import RentProperties from './sliders/RentProperties';
import SaleProperties from './sliders/SaleProperties';
import ServiceCompanies from './sliders/ServiceCompanies';

export default function HomeAll() {
  const [feedData, setFeedData] = useState<HomeFeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Fetch Function ---
  const loadFeed = async () => {
    try {
      const data = await feedService.getHomeFeed();
      setFeedData(data);
    } catch (error) {
      console.error('Failed to fetch home feed:', error);
      // In a production app, you might set an error state here to show a retry button
    } finally {
      setIsLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    loadFeed();
  }, []);

  // --- Pull to Refresh Handle ---
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
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
