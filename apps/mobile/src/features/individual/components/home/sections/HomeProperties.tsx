import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import PropertyDetailsSheet from '@/features/individual/components/PropertyDetailsSheet';
import { feedService } from '@/features/individual/services/feed.service';
import { propertiesService } from '@/shared/api/properties.service';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertyListItem from '@/shared/components/PropertyListItem';
import PropertyListSkeleton from '@/shared/components/skeletons/PropertyListSkeleton';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { formatTimeAgo } from '@/shared/utils/helpers/property';
import { PropertyDto } from '@/types/feed';
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
  const { isTablet, cardColumns } = useResponsiveLayout();
  const [data, setData] = useState<PropertyDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(true);

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

      setData((prev) => {
        const combined = [...prev, ...response.data];
        return combined.filter(
          (item, idx) => combined.findIndex((i) => i.id === item.id) === idx,
        );
      });
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more properties:', error);
    } finally {
      setIsLoadingMore(false);
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

  const renderEmptyComponent = (mode: 'card' | 'list') => () => {
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
        <FlatList
          key={isTablet ? `tablet-grid-${cardColumns}` : 'phone-list'}
          numColumns={isTablet ? cardColumns : 1}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyComponent('card')}
          columnWrapperStyle={
            isTablet
              ? { gap: 16, justifyContent: 'flex-start', marginBottom: 16 }
              : undefined
          }
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
              cardWidth={
                isTablet
                  ? (680 - 40 - (cardColumns - 1) * 16) / cardColumns
                  : '100%'
              }
              phone={item.phoneNumber || item.phone}
              timeAgo={
                item.createdAt ? formatTimeAgo(item.createdAt) : undefined
              }
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

      {/* 2. List View FlatList */}
      <View style={viewMode === 'list' ? { flex: 1 } : { display: 'none' }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyComponent('list')}
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
