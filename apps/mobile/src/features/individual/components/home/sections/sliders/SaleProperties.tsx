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

import { usePropertyPreviewSheet } from '@/features/individual/components/property-details-sheet/usePropertyPreviewSheet';
import PropertyDetailsSheet from '@/features/individual/components/PropertyDetailsSheet';
import { feedService } from '@/features/individual/services/feed.service';
import PropertyCard from '@/shared/components/property/PropertyCard';
import PropertyListItem from '@/shared/components/property/PropertyListItem';
import {
  formatTimeAgo,
  publishedDate,
  shareProperty,
} from '@/shared/utils/helpers/property';
import { PropertyDto } from '@/types/feed';

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

interface SalePropertiesProps {
  initialData: PropertyDto[];
  viewMode?: 'card' | 'list';
}

export default function SaleProperties({
  initialData,
  viewMode = 'card',
}: SalePropertiesProps) {
  const router = useRouter();

  // Details sheet opens with the card's data, then fills in full details
  const {
    sheetRef: detailsSheetRef,
    property: selectedProperty,
    isLoadingDetails,
    openDetails,
  } = usePropertyPreviewSheet('SALE');

  // Page 1 comes from the parent's home-feed prop; this query only fetches
  // subsequent pages as the user scrolls the horizontal list.
  const {
    data: infiniteData,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['saleProperties'],
    queryFn: ({ pageParam }) =>
      feedService.getProperties('SALE', pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
    initialData: {
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
    },
  });

  const data = useMemo(() => {
    const combined = infiniteData.pages.flatMap((page) => page.data);
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [infiniteData]);

  // Triggered when user scrolls to the end of the horizontal list
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
      <SectionHeader title="عقارات للبيع" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mr-4">
            {viewMode === 'list' ? (
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
                cardWidth={HORIZONTAL_CARD_WIDTH}
                onPress={() => openDetails(item)}
                onShowDetails={() => openDetails(item)}
                onShare={() => shareProperty(item)}
              />
            ) : (
              <PropertyCard
                {...item}
                timeAgo={
                  publishedDate(item) ? formatTimeAgo(publishedDate(item)!) : undefined
                }
                cardWidth={HORIZONTAL_CARD_WIDTH}
                onShare={() => shareProperty(item)}
                onPress={() => openDetails(item)}
              />
            )}
          </View>
        )}
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5} // Trigger fetch when halfway through the last card
        ListFooterComponent={
          isLoadingMore ? (
            <View className="items-center justify-center px-4">
              <ActivityIndicator size="small" color="#15304D" />
            </View>
          ) : null
        }
      />

      <PropertyDetailsSheet
        ref={detailsSheetRef}
        property={selectedProperty}
        isLoadingDetails={isLoadingDetails}
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
}
