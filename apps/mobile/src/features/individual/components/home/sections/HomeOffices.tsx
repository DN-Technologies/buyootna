import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import OfficeListCard from '@/features/individual/components/offices/OfficeListCard';
import { feedService } from '@/features/individual/services/feed.service';
import CompanySkeleton from '@/shared/components/skeletons/CompanySkeleton';
import { OfficeDto } from '@/types/feed';

interface HomeOfficesProps {
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function HomeOffices({
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
}: HomeOfficesProps) {
  const router = useRouter();
  const [data, setData] = useState<OfficeDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchOffices = async () => {
      setIsLoading(true);
      try {
        const response = await feedService.getOffices(1, 10);
        setData(response.data);
        setPage(response.meta.current);
        setHasNextPage(response.meta.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffices();
  }, []);

  const fetchMoreData = async () => {
    if (isLoadingMore || !hasNextPage || isLoading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await feedService.getOffices(nextPage, 10);

      setData((prev) => {
        const combined = [...prev, ...response.data];
        return combined.filter(
          (item, idx) => combined.findIndex((i) => i.id === item.id) === idx,
        );
      });
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more offices:', error);
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={{ paddingTop: 10 }}>
          {[1, 2, 3].map((key) => (
            <CompanySkeleton key={key} cardWidth="100%" />
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
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyComponent}
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
}
