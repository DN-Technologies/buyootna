import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { feedService } from '@/core/api/feed.service';
import CompanyCard from '@/core/components/CompanyCard';
import CompanySkeleton from '@/core/components/skeletons/CompanySkeleton';
import { CompanyDto } from '@/types/feed';

interface HomeCompaniesProps {
  activeFilter?:
    | 'all'
    | 'finishing'
    | 'transport'
    | 'building'
    | 'decorations'
    | 'interior_design'
    | 'other';
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function HomeCompanies({
  activeFilter = 'all',
  refreshing = false,
  onRefresh,
}: HomeCompaniesProps) {
  const [data, setData] = useState<CompanyDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(true);

  // Helper to map frontend filter strings to backend category names in Arabic
  const getBackendCategory = (filter: string) => {
    switch (filter) {
      case 'finishing':
        return 'تشطيب';
      case 'transport':
        return 'نقل';
      case 'building':
        return 'بناء';
      case 'decorations':
        return 'ديكورات';
      case 'interior_design':
        return 'تصميم داخلي';
      case 'other':
        return 'أخرى';
      default:
        return undefined; // 'all' means no filter
    }
  };

  // --- 1. Fetch Fresh Data when Filter Changes ---
  useEffect(() => {
    const fetchFilteredCompanies = async () => {
      setIsFilterLoading(true);
      try {
        const categoryFilter = getBackendCategory(activeFilter);

        // Call the paginated endpoint
        const response = await feedService.getCompanies(categoryFilter, 1, 10);

        setData(response.data);
        setPage(response.meta.current);
        setHasNextPage(response.meta.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsFilterLoading(false);
      }
    };

    fetchFilteredCompanies();
  }, [activeFilter]);

  // --- 2. Infinite Scroll Logic ---
  const fetchMoreData = async () => {
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const categoryFilter = getBackendCategory(activeFilter);

      const response = await feedService.getCompanies(
        categoryFilter,
        nextPage,
        10,
      );

      setData((prev) => [...prev, ...response.data]);
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more companies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // --- 3. Render States ---
  if (isFilterLoading) {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        {[1, 2, 3].map((key) => (
          <CompanySkeleton key={key} cardWidth="100%" />
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="items-center justify-center px-5 py-20">
        <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
          لا توجد شركات
        </Text>
        <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
          عذراً، لا توجد شركات مطابقة لهذا التصنيف حالياً. جرب تغيير عوامل
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
        <CompanyCard
          id={item.id}
          name={item.name}
          category={item.category}
          rating={item.rating}
          projectsCount={item.projectsCount}
          serviceArea={item.serviceArea}
          logoUrl={item.logoUrl}
          isVerified={item.isVerified}
          isFavorite={item.isFavorite}
          cardWidth="100%"
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
