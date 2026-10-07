import { ScrollView, Text, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

import MapPreview from '@/shared/components/map/MapPreview';
import ListerProfileSnippet from '@/shared/components/property/ListerProfileSnippet';
import PropertyDetailsBody from '@/shared/components/property/PropertyDetailsBody';
import PropertyMediaHeader from '@/shared/components/property/PropertyMediaHeader';
import PropertyOverview from '@/shared/components/property/PropertyOverview';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  getArabicTypeLabel,
  publishedDate,
} from '@/shared/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface PropertyDetailsContentProps {
  property: PropertyDetailsDto;
  isFavorite: boolean;
  insets: EdgeInsets;
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onHostPress: () => void;
}

export default function PropertyDetailsContent({
  property,
  isFavorite,
  insets,
  onBack,
  onFavorite,
  onShare,
  onHostPress,
}: PropertyDetailsContentProps) {
  const displayTitle = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 16) + 90,
      }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <ContentContainer>
        {/* --- Media Header (Scrolls with page) --- */}
        <PropertyMediaHeader
          images={
            property.images && property.images.length > 0
              ? property.images
              : []
          }
          insets={insets}
          onBack={onBack}
          isFavorite={isFavorite}
          onFavorite={onFavorite}
          onShare={onShare}
        />

        {/* --- Card 1: Property Specs & Overview --- */}
        <PropertyOverview
          type={property.type}
          title={displayTitle}
          price={property.price}
          isFeatured={property.isFeatured}
          timeAgo={formatTimeAgo(publishedDate(property) ?? property.createdAt)}
          views={property.views}
          area={property.areaSize ?? property.area}
          location={property.location}
          floor={property.floors}
          beds={property.beds}
          baths={property.baths}
          requestYear={property.requestYear?.toString()}
          requiredYear={property.requiredYear?.toString()}
          licenseNumber={property.licenseNumber}
        />

        {/* --- Card 2: Dynamic Details Sections (Description, Requirements, Features, Rental Terms) --- */}
        <View className="mt-4">
          <PropertyDetailsBody
            type={property.type}
            description={property.description}
            features={
              property.features && property.features.length > 0
                ? property.features.map((f: any) =>
                    typeof f === 'string' ? f : f.label || f.name || f.id,
                  )
                : []
            }
            exchangeRequirement={
              property.type === 'EXCHANGE'
                ? property.description
                : undefined
            }
            additionalCosts={
              property.type === 'RENT'
                ? property.additionalExpenses || undefined
                : undefined
            }
            rentTerms={
              property.type === 'RENT'
                ? property.rentConditions || undefined
                : undefined
            }
          />
        </View>

        {/* --- Card 3: Map Preview --- */}
        <View className="mt-1">
          <MapPreview
            location={property.location}
            latitude={property.latitude}
            longitude={property.longitude}
          />
        </View>

        {/* --- Card 4: Lister/Host Profile Snippet --- */}
        <View className="mt-5 px-5">
          <ListerProfileSnippet
            name={property.host?.name ?? 'مستخدم'}
            joinedDate={property.host?.joinedDate ?? ''}
            rating={property.host?.rating ?? 0}
            reviewsCount={property.host?.reviewsCount}
            avatarUrl={property.host?.avatarUrl ?? ''}
            isVerified={property.host?.isVerified}
            onPress={onHostPress}
          />
        </View>

        {/* --- Ad Reference Number --- */}
        {property.referenceNumber && (
          <Text className="my-6 text-center font-cairo-semibold text-sm text-[#6B6A6A]">
            رقم المرجعي للاعلان: {property.referenceNumber}
          </Text>
        )}
      </ContentContainer>
    </ScrollView>
  );
}
