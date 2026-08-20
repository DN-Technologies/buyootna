import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';

import PropertyDetailsSheet from '@/features/individual/components/PropertyDetailsSheet';
import { useFavorites } from '@/features/individual/hooks/useFavorites';
import { useTabBarHeight } from '@/features/individual/hooks/useTabBarHeight';
import { feedService } from '@/features/individual/services/feed.service';
import { propertiesService } from '@/shared/api/properties.service';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertyListItem from '@/shared/components/PropertyListItem';
import PropertyListSkeleton from '@/shared/components/skeletons/PropertyListSkeleton';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { formatTimeAgo } from '@/shared/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface HomePropertiesProps {
  activeFilter: 'all' | 'sale' | 'rent' | 'exchange';
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  viewMode?: 'card' | 'list';
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function HomeProperties({
  activeFilter = 'all',
  refreshing = false,
  onRefresh,
  viewMode = 'card',
  ListHeaderComponent,
}: HomePropertiesProps) {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();
  const { isTablet, cardColumns } = useResponsiveLayout();
  const { favoritedIds, toggleFavorite } = useFavorites();

  // Bottom Sheet Ref & Selected Property State
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyDetailsDto | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

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

  const {
    data: infiniteData,
    isLoading: isFilterLoading,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['homeProperties', activeFilter],
    queryFn: ({ pageParam }) =>
      feedService.getProperties(getBackendType(activeFilter), pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
  });

  const data = (() => {
    const combined = infiniteData?.pages.flatMap((page) => page.data) ?? [];
    return combined.filter(
      (item, idx) => combined.findIndex((i) => i.id === item.id) === idx,
    );
  })();

  const fetchMoreData = () => {
    if (hasNextPage && !isLoadingMore) {
      fetchNextPage();
    }
  };

  // Handle "عرض تفاصيل" click
  const handleShowDetails = async (id: string) => {
    setSelectedProperty(null);
    detailsSheetRef.current?.present();
    if (isFetchingDetails) return;
    setIsFetchingDetails(true);
    try {
      const fullDetails = await propertiesService.getPropertyById(id);
      setSelectedProperty(fullDetails);
    } catch (error) {
      console.error('Failed to fetch property details:', error);
      detailsSheetRef.current?.dismiss();
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const renderEmptyComponent = (mode: 'card' | 'list') => {
    if (isFilterLoading) {
      return (
        <View style={{ paddingTop: 10 }}>
          {[1, 2, 3].map((key) =>
            mode === 'list' ? (
              <PropertyListSkeleton key={key} cardWidth="100%" />
            ) : (
              <PropertySkeleton key={key} cardWidth="100%" />
            ),
          )}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20">
        <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
          لا توجد عقارات
        </Text>
        <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
          عذراً، لا توجد عقارات مطابقة لهذا التصنيف حالياً. جرب تغيير عوامل
          التصفية.
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* 1. Card View FlatList */}
      <View style={viewMode === 'card' ? { flex: 1 } : { display: 'none' }}>
        <FlashList
          key={isTablet ? `tablet-grid-${cardColumns}` : 'phone-list'}
          numColumns={isTablet ? cardColumns : 1}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyComponent('card')}
          data={data}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => {
            const card = (
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
                cardWidth={
                  isTablet
                    ? (680 - 40 - (cardColumns - 1) * 16) / cardColumns
                    : '100%'
                }
                timeAgo={
                  item.createdAt ? formatTimeAgo(item.createdAt) : undefined
                }
                isFavorited={favoritedIds.includes(item.id)}
                onFavorite={() => toggleFavorite(item.id)}
              />
            );
            // FlashList v2 dropped columnWrapperStyle, so the tablet grid's
            // inter-card gap (previously `{ gap: 16, marginBottom: 16 }`)
            // is replicated as padding baked into each cell instead.
            return isTablet ? (
              <View style={{ paddingHorizontal: 8, paddingBottom: 16 }}>
                {card}
              </View>
            ) : (
              card
            );
          }}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore || isFetchingDetails ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#15304D" />
              </View>
            ) : null
          }
        />
      </View>

      {/* 2. List View FlatList */}
      <View style={viewMode === 'list' ? { flex: 1 } : { display: 'none' }}>
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyComponent('list')}
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
            <PropertyListItem
              id={item.id}
              price={item.price}
              companyName={item.companyName}
              isFeatured={item.isFeatured}
              categoryLabel={item.categoryLabel}
              beds={item.beds}
              area={item.area}
              location={item.location}
              propertyIncome={item.propertyIncome}
              isFavorited={favoritedIds.includes(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => handleShowDetails(item.id)}
              onShowDetails={() => handleShowDetails(item.id)}
            />
          )}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore || isFetchingDetails ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#15304D" />
              </View>
            ) : null
          }
        />
      </View>

      {/* Expanded details bottom sheet */}
      <PropertyDetailsSheet
        ref={detailsSheetRef}
        property={selectedProperty}
        isFavorited={
          selectedProperty ? favoritedIds.includes(selectedProperty.id) : false
        }
        onFavorite={() =>
          selectedProperty && toggleFavorite(selectedProperty.id)
        }
        onClose={() => detailsSheetRef.current?.dismiss()}
        onViewProperty={() => {
          if (selectedProperty) {
            detailsSheetRef.current?.dismiss();
            router.push(`/property/${selectedProperty.id}`);
          }
        }}
      />
    </View>
  );
}
