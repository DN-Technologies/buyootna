import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { feedService } from '@/core/api/feed.service';
import PropertyCard from '@/core/components/PropertyCard';
import { PropertyDto } from '@/types/feed';

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

interface SalePropertiesProps {
  initialData: PropertyDto[];
}

export default function SaleProperties({ initialData }: SalePropertiesProps) {
  const [data, setData] = useState<PropertyDto[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Triggered when user scrolls to the end of the horizontal list
  const fetchMoreData = async () => {
    // Stop fetching if we are already loading or if there are no more pages
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const response = await feedService.getProperties('SALE', nextPage, 10);

      setData((prev) => [...prev, ...response.data]); // Append new items
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <View className="justify-center">
      <SectionHeader title="عقارات للبيع" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mr-4">
            <PropertyCard {...item} cardWidth={HORIZONTAL_CARD_WIDTH} />
          </View>
        )}
        // Infinite Scroll Triggers:
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5} // Trigger fetch when halfway through the last card
        ListFooterComponentClassName="items-center justify-center"
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color="#15304D" className="ml-4" />
          ) : null
        }
      />
    </View>
  );
}
