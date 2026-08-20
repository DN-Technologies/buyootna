import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COMPANIES_DATA } from '@/assets/mock/companiesData';
import CompanyCard from '@/features/individual/components/CompanyCard';
import { feedService } from '@/features/individual/services/feed.service';
import { CompanyDto } from '@/types/feed';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

// Mock records don't carry backend-only fields (userId, reviewsCount, lastActivityAt); fill them with harmless defaults
const toCompanyDto = (company: (typeof COMPANIES_DATA)[number]): CompanyDto => ({
  ...company,
  userId: company.id,
  reviewsCount: 0,
  lastActivityAt: new Date().toISOString(),
});

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
  const router = useRouter();

  // No companies came from the parent's home feed — fall back to local mock
  // data (e.g. cold-start / empty backend) instead of showing nothing.
  const isMockFallback = initialData.length === 0;

  const {
    data: infiniteData,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['serviceCompanies', activeFilter, isMockFallback],
    queryFn: async ({ pageParam }) => {
      if (isMockFallback) {
        // Simulate API call delay for subsequent pages, matching the real fetch's latency.
        if (pageParam > 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        const limit = 10;
        const start = (pageParam - 1) * limit;
        const end = start + limit;

        const filteredMock =
          activeFilter === 'all'
            ? COMPANIES_DATA
            : COMPANIES_DATA.filter((company) =>
                company.filterTags.includes(activeFilter),
              );

        return {
          data: filteredMock.slice(start, end).map(toCompanyDto),
          meta: {
            total: filteredMock.length,
            current: pageParam,
            limit,
            totalPages: Math.ceil(filteredMock.length / limit),
            hasNextPage: end < filteredMock.length,
          },
        };
      }

      return feedService.getCompanies(
        activeFilter === 'all' ? undefined : activeFilter,
        pageParam,
        10,
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
    // The 'all' filter's first page is already available from the parent's
    // home feed — seed it so there's no redundant refetch.
    initialData:
      !isMockFallback && activeFilter === 'all'
        ? {
            pages: [
              {
                data: initialData,
                meta: {
                  total: initialData.length,
                  current: 1,
                  limit: 10,
                  totalPages: 1,
                  hasNextPage: true,
                },
              },
            ],
            pageParams: [1],
          }
        : undefined,
  });

  const data = useMemo(() => {
    const combined = infiniteData?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [infiniteData]);

  // Load more local or API companies
  const isFetchingRef = useRef(false);
  const fetchMoreData = () => {
    if (hasNextPage && !isLoadingMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
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
                onPress={() => router.push(`/company/${item.id}`)}
              />
            </View>
          )}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="items-center justify-center px-4">
                <ActivityIndicator size="small" color="#15304D" />
              </View>
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
