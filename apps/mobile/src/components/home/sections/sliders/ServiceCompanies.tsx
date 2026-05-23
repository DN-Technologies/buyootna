import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COMPANIES_DATA } from '@/assets/mock/companiesData';
import { feedService } from '@/core/api/feed.service';
import CompanyCard from '@/core/components/CompanyCard';
import { CompanyDto } from '@/types/feed';

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

export { COMPANIES_DATA };

interface ServiceCompaniesProps {
  initialData: CompanyDto[];
  activeFilter?: string;
}

export default function ServiceCompanies({
  initialData,
  activeFilter = 'all',
}: ServiceCompaniesProps) {
  const [data, setData] = useState<CompanyDto[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Sync state when filter changes, falling back to local mock data if needed
  useEffect(() => {
    const isMockFallback = initialData.length === 0;

    if (isMockFallback) {
      const sourceData =
        activeFilter === 'all'
          ? COMPANIES_DATA.slice(0, 10)
          : COMPANIES_DATA.filter((company) =>
              company.filterTags.includes(activeFilter),
            ).slice(0, 10);

      setData(sourceData);
      setPage(1);
      setHasNextPage(
        activeFilter === 'all'
          ? COMPANIES_DATA.length > 10
          : COMPANIES_DATA.filter((company) =>
              company.filterTags.includes(activeFilter),
            ).length > 10,
      );
    } else {
      if (activeFilter === 'all') {
        setData(initialData);
        setPage(1);
        setHasNextPage(true);
      } else {
        // Fetch first page from API
        const fetchFiltered = async () => {
          setIsLoadingMore(true);
          try {
            const response = await feedService.getCompanies(activeFilter, 1, 10);
            setData(response.data);
            setPage(response.meta.current);
            setHasNextPage(response.meta.hasNextPage);
          } catch (error) {
            console.error('Failed to fetch filtered companies:', error);
          } finally {
            setIsLoadingMore(false);
          }
        };
        fetchFiltered();
      }
    }
  }, [activeFilter, initialData]);

  // Load more local or API companies
  const fetchMoreData = async () => {
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const isMockFallback = initialData.length === 0;

      if (isMockFallback) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const limit = 10;
        const start = (nextPage - 1) * limit;
        const end = start + limit;

        const filteredMock =
          activeFilter === 'all'
            ? COMPANIES_DATA
            : COMPANIES_DATA.filter((company) =>
                company.filterTags.includes(activeFilter),
              );

        const newData = filteredMock.slice(start, end);

        if (newData.length > 0) {
          setData((prev) => [...prev, ...newData]);
          setPage(nextPage);
          setHasNextPage(end < filteredMock.length);
        } else {
          setHasNextPage(false);
        }
      } else {
        // Fetch from API
        const response = await feedService.getCompanies(
          activeFilter === 'all' ? undefined : activeFilter,
          nextPage,
          10,
        );
        setData((prev) => [...prev, ...response.data]);
        setPage(response.meta.current);
        setHasNextPage(response.meta.hasNextPage);
      }
    } catch (error) {
      console.error('Failed to load more companies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <View className="justify-center">
      <SectionHeader title="شركات الخدمات" />
      {data.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mr-4">
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
                cardWidth={HORIZONTAL_CARD_WIDTH}
              />
            </View>
          )}
          // Infinite Scroll Triggers:
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color="#15304D"
                className="ml-4"
              />
            ) : null
          }
        />
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
