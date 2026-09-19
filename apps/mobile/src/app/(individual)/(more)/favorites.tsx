import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FavoritesResponse,
  favoritesService,
} from '@/shared/api/favorites.service';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { shareProperty } from '@/shared/utils/helpers/property';

const FAVORITES_QUERY_KEY = ['favorites'];

export default function FavoritesScreen() {
  const router = useRouter();
  const { toggleFavorite } = useFavorites();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: ({ pageParam }) => favoritesService.getFavorites(pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  const properties = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Discard any pages loaded beyond the first before refetching, so a
    // pull-to-refresh resets the list back to a fresh page 1.
    queryClient.setQueryData(
      FAVORITES_QUERY_KEY,
      (old: { pages: FavoritesResponse[]; pageParams: number[] } | undefined) =>
        old
          ? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) }
          : old,
    );
    await refetch();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    await toggleFavorite(propertyId);
    // Optimistically remove from list
    queryClient.setQueryData(
      FAVORITES_QUERY_KEY,
      (old: { pages: FavoritesResponse[]; pageParams: number[] } | undefined) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((p) => p.id !== propertyId),
              })),
            }
          : old,
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-bold text-lg text-[#111111]">
          العقارات المحفوظة
        </Text>
        <View className="w-8" />
      </View>

      {/* List */}
      <FlashList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#15304D"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3].map((key) => (
                <View key={key} className="mb-4">
                  <PropertySkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center px-5 py-20">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <Feather name="heart" size={28} color="#64748B" />
              </View>
              <Text className="mb-2 text-center font-cairo-bold text-lg text-[#111111]">
                لا توجد عقارات محفوظة
              </Text>
              <Text className="text-center font-cairo-medium text-sm leading-6 text-[#64748B]">
                احفظ العقارات التي تعجبك لتجدها هنا لاحقاً وتتابع تحديثاتها
                بسهولة.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View className="mb-4">
            <PropertyCard
              id={item.id}
              images={item.images}
              price={item.price}
              companyName={item.host.name}
              categoryLabel={item.category}
              propertyIncome={item.propertyIncome}
              area={item.area}
              beds={item.beds}
              baths={item.baths}
              location={item.location}
              isFavorited={true}
              onPress={() => router.push(`/property/${item.id}`)}
              onFavorite={() => handleFavoriteToggle(item.id)}
              onShare={() => shareProperty(item)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
