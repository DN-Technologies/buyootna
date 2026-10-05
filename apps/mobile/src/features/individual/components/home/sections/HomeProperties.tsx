import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { forwardRef, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { HomeSort } from '@/features/individual/components/home/homeSort';
import PropertyDetailsSheet from '@/features/individual/components/PropertyDetailsSheet';
import { feedService } from '@/features/individual/services/feed.service';
import { propertiesService } from '@/shared/api/properties.service';
import PropertyCard from '@/shared/components/property/PropertyCard';
import PropertyListItem from '@/shared/components/property/PropertyListItem';
import PropertyListSkeleton from '@/shared/components/skeletons/PropertyListSkeleton';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';
import { useAuthStore } from '@/shared/store/useAuthStore';
import {
  formatTimeAgo,
  publishedDate,
  shareProperty,
} from '@/shared/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface HomePropertiesProps {
  activeFilter: 'all' | 'sale' | 'rent' | 'exchange';
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  viewMode?: 'card' | 'list';
  sortBy?: HomeSort;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default forwardRef<FlashListRef<any>, HomePropertiesProps>(
  function HomeProperties(
    {
      activeFilter = 'all',
      refreshing = false,
      onRefresh,
      viewMode = 'card',
      sortBy = 'DEFAULT',
      ListHeaderComponent,
    },
    ref,
  ) {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();
  const { isTablet, cardColumns } = useResponsiveLayout();
  const { favoritedIds, toggleFavorite } = useFavorites();
  const token = useAuthStore((state) => state.token);

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
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    // Includes `token` so a login/logout while this screen stays mounted
    // (the (individual) tab group is reused across the auth flow -- see
    // resetToIdentityHome) triggers a real refetch of user-specific
    // results (e.g. per-user pricing/eligibility) instead of continuing to
    // show whatever was cached from before the auth state changed.
    queryKey: ['homeProperties', activeFilter, sortBy, token],
    queryFn: ({ pageParam }) =>
      feedService.getProperties(
        getBackendType(activeFilter),
        pageParam,
        10,
        sortBy,
      ),
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
    if (hasNextPage && !isLoadingMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
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
    if (isError) {
      return (
        <View className="items-center justify-center py-20">
          <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
            تعذر تحميل العقارات
          </Text>
          <Text className="mb-4 text-center font-cairo-medium text-sm text-[#6B6A6A]">
            حدث خطأ أثناء تحميل العقارات. تأكد من اتصالك بالشبكة.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => refetch()}
            className="rounded-full bg-[#15304D] px-6 py-3"
          >
            <Text className="font-cairo-semibold text-sm text-white">
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
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
      {/* Only the active view's list is mounted — a display:none list
          collapses to zero size, which forces FlashList into an expensive
          full relayout the moment it's shown again. Switching views now
          costs a fresh mount instead, and loses scroll position on switch,
          which is the right trade for actually being fast. */}
      {viewMode === 'card' ? (
        <FlashList
          ref={ref}
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
                categoryLabel={item.categoryLabel}
                propertyIncome={item.propertyIncome}
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
                  publishedDate(item) ? formatTimeAgo(publishedDate(item)!) : undefined
                }
                isFavorited={favoritedIds.includes(item.id)}
                onFavorite={() => toggleFavorite(item.id)}
                onShare={() => shareProperty(item)}
                // Any card tap opens the details sheet — with or without
                // images, exactly like the list view (QA: with-image cards
                // used to skip the sheet and navigate to the full page)
                onPress={() => handleShowDetails(item.id)}
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
      ) : (
        <FlashList
          ref={ref}
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
              onShare={() => shareProperty(item)}
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
      )}

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
        onShare={() => selectedProperty && shareProperty(selectedProperty)}
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
  },
);
