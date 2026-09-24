import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import ProfileEmptyState from '@/shared/components/profile/ProfileEmptyState';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertyListItem from '@/shared/components/PropertyListItem';
import { shareProperty } from '@/shared/utils/helpers/property';
import { PropertyDto } from '@/types/feed';

interface ProfileListingsTabProps {
  properties: PropertyDto[];
  viewMode: 'card' | 'list';
  isLoading?: boolean;
  bottomInset?: number;
  renderHeader: () => React.ReactElement;
  onShowDetails?: (id: string) => void;
  onShare?: (item: PropertyDto) => void;
}

export default function ProfileListingsTab({
  properties,
  viewMode,
  isLoading,
  bottomInset = 0,
  renderHeader,
  onShowDetails,
  onShare,
}: ProfileListingsTabProps) {
  const router = useRouter();

  const handleShowDetails =
    onShowDetails || ((propertyId: string) => router.push(`/property/${propertyId}`));
  const handleShare = onShare || ((item: PropertyDto) => shareProperty(item));

  return (
    <FlashList
      key="listings-list"
      data={properties}
      keyExtractor={(item) => item.id}
      extraData={viewMode}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <ProfileEmptyState tab="listings" isLoading={isLoading} />
      }
      contentContainerStyle={{
        paddingBottom: bottomInset + 85,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View className="mt-2 px-5">
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
              onShowDetails={() => handleShowDetails(item.id)}
              onShare={() => handleShare(item)}
            />
          ) : (
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
              onShare={() => handleShare(item)}
            />
          )}
        </View>
      )}
    />
  );
}
