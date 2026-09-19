import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { forwardRef, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';

import OfficeListCard from '@/features/individual/components/offices/OfficeListCard';
import { feedService } from '@/features/individual/services/feed.service';
import OfficeListSkeleton from '@/shared/components/skeletons/OfficeListSkeleton';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';

interface HomeOfficesProps {
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default forwardRef<FlashListRef<any>, HomeOfficesProps>(
  function HomeOffices(
    { refreshing = false, onRefresh, ListHeaderComponent }: HomeOfficesProps,
    ref,
  ) {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['offices'],
    queryFn: ({ pageParam }) => feedService.getOffices(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
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

  const isFetchingRef = useRef(false);
  const fetchMoreData = () => {
    if (hasNextPage && !isLoadingMore && !isLoading && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
    }
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={{ paddingTop: 10 }}>
          {[1, 2, 3].map((key) => (
            <OfficeListSkeleton key={key} />
          ))}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20">
        <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
          لا توجد مكاتب عقارية
        </Text>
        <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
          عذراً، لا توجد مكاتب عقارية متاحة حالياً.
        </Text>
      </View>
    );
  };

  return (
    <FlashList
      ref={ref}
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: scrollContentBottomPadding,
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
        <OfficeListCard
          id={item.id}
          name={item.name}
          rating={item.rating}
          reviewsCount={item.reviewsCount}
          location={item.location}
          logoUrl={item.logoUrl}
          isVerified={item.isVerified}
          phone={item.phone}
          whatsapp={item.whatsapp}
          isFavorite={favoriteOverrides[item.id] ?? item.isFavorite ?? false}
          onPress={() => router.push(`/office/${item.id}` as any)}
          onToggleFavorite={() =>
            setFavoriteOverrides((prev) => ({
              ...prev,
              [item.id]: !(prev[item.id] ?? item.isFavorite ?? false),
            }))
          }
        />
      )}
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
  },
);
