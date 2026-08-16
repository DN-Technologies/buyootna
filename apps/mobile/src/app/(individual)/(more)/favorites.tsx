import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { favoritesService } from '@/features/individual/services/favorites.service';
import { useFavoritesStore } from '@/features/individual/store/useFavoritesStore';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import { PropertyDetailsDto } from '@/types/property';

export default function FavoritesScreen() {
  const router = useRouter();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [properties, setProperties] = useState<PropertyDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadFavorites = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1 && !shouldRefresh) setIsLoading(true);
      const res = await favoritesService.getFavorites(pageNum, 10);
      if (pageNum === 1) {
        setProperties(res.data);
      } else {
        setProperties((prev) => [...prev, ...res.data]);
      }
      setHasNextPage(res.meta.hasNextPage);
      setPage(pageNum);
    } catch (e) {
      console.error('Failed to load favorites list:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites(1);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFavorites(1, true);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      loadFavorites(page + 1);
    }
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    await toggleFavorite(propertyId);
    // Optimistically remove from list
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
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
      <FlatList
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
              area={item.area}
              beds={item.beds}
              baths={item.baths}
              location={item.location}
              onPress={() => router.push(`/property/${item.id}`)}
              onFavorite={() => handleFavoriteToggle(item.id)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
