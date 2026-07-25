import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { feedService } from '@/core/api/feed.service';
import { propertiesService } from '@/core/api/properties.service';
import PropertyCard from '@/core/components/PropertyCard';
import PropertyDetailsSheet from '@/core/components/PropertyDetailsSheet';
import PropertyListItem from '@/core/components/PropertyListItem';
import { formatTimeAgo } from '@/core/utils/helpers/property';
import { PropertyDto } from '@/types/feed';
import { PropertyDetailsDto } from '@/types/property';

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

interface ExchangePropertiesProps {
  initialData: PropertyDto[];
  viewMode?: 'card' | 'list';
}

export default function ExchangeProperties({
  initialData,
  viewMode = 'card',
}: ExchangePropertiesProps) {
  const router = useRouter();
  const [data, setData] = useState<PropertyDto[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Bottom Sheet Ref & Selected Property State
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyDetailsDto | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Triggered when user scrolls to the end of the horizontal list
  const fetchMoreData = async () => {
    // Stop fetching if we are already loading or if there are no more pages
    if (isLoadingMore || !hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const response = await feedService.getProperties(
        'EXCHANGE',
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
      console.error('Failed to load more exchange properties:', error);
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleShowDetails = async (id: string) => {
    setSelectedProperty(null);
    detailsSheetRef.current?.present();
    if (isFetchingDetails) return;
    setIsFetchingDetails(true);
    try {
      const fullDetails = await propertiesService.getPropertyById(id);
      setSelectedProperty(fullDetails);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      detailsSheetRef.current?.dismiss();
    } finally {
      setIsFetchingDetails(false);
    }
  };

  return (
    <View className="justify-center">
      <SectionHeader title="عقارات للبدل" />
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
                category={item.type}
                area={item.area}
                location={item.location}
                propertyIncome={item.propertyIncome}
                cardWidth={HORIZONTAL_CARD_WIDTH}
                onPress={() => handleShowDetails(item.id)}
                onShowDetails={() => handleShowDetails(item.id)}
              />
            ) : (
              <PropertyCard
                {...item}
                phone={item.phoneNumber || item.phone}
                timeAgo={
                  item.createdAt ? formatTimeAgo(item.createdAt) : undefined
                }
                cardWidth={HORIZONTAL_CARD_WIDTH}
              />
            )}
          </View>
        )}
        // Infinite Scroll Triggers:
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5} // Trigger fetch when halfway through the last card
        ListFooterComponentClassName="items-center justify-center"
        ListFooterComponent={
          isLoadingMore || isFetchingDetails ? (
            <ActivityIndicator size="small" color="#15304D" className="ml-4" />
          ) : null
        }
      />

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
