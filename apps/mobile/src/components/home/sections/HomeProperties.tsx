import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { feedService } from '@/core/api/feed.service';
import PropertyCard from '@/core/components/PropertyCard';
import PropertySkeleton from '@/core/components/skeletons/PropertySkeleton';
import { formatTimeAgo } from '@/core/utils/helpers/property';
import { PropertyDto } from '@/types/feed';

interface HomePropertiesProps {
  activeFilter: 'all' | 'sale' | 'rent' | 'exchange';
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function HomeProperties({
  activeFilter = 'all',
  refreshing = false,
  onRefresh,
}: HomePropertiesProps) {
  const [data, setData] = useState<PropertyDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(true);

  // Helper to map frontent filter strings to backend Prisma Enums
  const getBackendType = (filter: string) => {
    switch (filter) {
      case 'sale':
        return 'SALE';
      case 'rent':
        return 'RENT';
      case 'exchange':
        return 'EXCHANGE';
      default:
        return undefined; // 'all' means no filter
    }
  };

  // --- 1. Fetch Fresh Data when Filter Changes ---
  useEffect(() => {
    const fetchFilteredProperties = async () => {
      setIsFilterLoading(true);
      try {
        const typeFilter = getBackendType(activeFilter);

        // Call the paginated endpoint
        const response = await feedService.getProperties(typeFilter, 1, 10);

        setData(response.data);
        setPage(response.meta.current);
        setHasNextPage(response.meta.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsFilterLoading(false);
      }
    };

    fetchFilteredProperties();
  }, [activeFilter]);

  // --- 2. Infinite Scroll Logic ---
  const fetchMoreData = async () => {
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const typeFilter = getBackendType(activeFilter);

      const response = await feedService.getProperties(
        typeFilter,
        nextPage,
        10,
      );

      setData((prev) => [...prev, ...response.data]);
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more properties:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // --- 3. Render States ---
  if (isFilterLoading) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        {[1, 2, 3].map((key) => (
          <PropertySkeleton key={key} cardWidth="100%" />
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="items-center justify-center px-5 py-20">
        <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
          لا توجد عقارات
        </Text>
        <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
          عذراً، لا توجد عقارات مطابقة لهذا التصنيف حالياً. جرب تغيير عوامل
          التصفية.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 10,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#15304D']}
            tintColor="#15304D"
          />
        ) : undefined
      }
      renderItem={({ item }) => (
        <PropertyCard
          id={item.id}
          images={item.images}
          price={item.price}
          companyName={item.companyName}
          isFeatured={item.isFeatured}
          type={item.type}
          area={item.area}
          beds={item.beds}
          baths={item.baths}
          location={item.location}
          timeAgo={item.createdAt ? formatTimeAgo(item.createdAt) : undefined}
          // Note: Since this is vertical, we DO NOT pass cardWidth.
          // It will naturally fill 100% of the screen width minus padding.
        />
      )}
      // Infinite Scroll Props:
      onEndReached={fetchMoreData}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#15304D" />
          </View>
        ) : null
      }
    />
  );
}
