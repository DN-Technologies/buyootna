import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import PropertyAdditionalDetails from '@/features/individual/components/property-details-sheet/PropertyAdditionalDetails';
import PropertyContactActionsBar from '@/features/individual/components/property-details-sheet/PropertyContactActionsBar';
import PropertyDescriptionSection from '@/features/individual/components/property-details-sheet/PropertyDescriptionSection';
import PropertyDetailsSheetHeader from '@/features/individual/components/property-details-sheet/PropertyDetailsSheetHeader';
import PropertyImageCarousel from '@/features/individual/components/property-details-sheet/PropertyImageCarousel';
import PropertyPriceViewsRow from '@/features/individual/components/property-details-sheet/PropertyPriceViewsRow';
import PropertySpecsRow from '@/features/individual/components/property-details-sheet/PropertySpecsRow';
import { usePropertyContactActions } from '@/features/individual/components/property-details-sheet/usePropertyContactActions';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
  publishedDate,
} from '@/shared/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface PropertyDetailsSheetProps {
  property: PropertyDetailsDto | null;
  isFavorited?: boolean;
  onViewProperty?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  onWhatsAppPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

const PropertyDetailsSheet = forwardRef<
  BottomSheetModal,
  PropertyDetailsSheetProps
>(
  (
    {
      property,
      isFavorited = false,
      onViewProperty,
      onFavorite,
      onShare,
      onClose,
      onWhatsAppPress,
      onCallPress,
      onChatPress,
    },
    ref,
  ) => {
    const snapPoints = useMemo(() => ['85%'], []);

    const { handleWhatsApp, handleCall, handleChat } =
      usePropertyContactActions({
        property,
        onClose,
        onWhatsAppPress,
        onCallPress,
        onChatPress,
      });

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const displayTitle = property
      ? `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`
      : 'تفاصيل العقار';

    const displayImages: (string | number)[] =
      property?.images && property.images.length > 0
        ? property.images
        : [require('@/assets/images/no-image.png')];

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView className="flex-1">
          <PropertyDetailsSheetHeader
            title={displayTitle}
            showActions={Boolean(property)}
            isFavorited={isFavorited}
            onFavorite={onFavorite}
            onShare={onShare}
            onClose={onClose}
          />

          {!property ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color="#15304D" />
              <Text className="mt-4 font-cairo text-sm text-[#6B6A6A]">
                جاري تحميل التفاصيل...
              </Text>
            </View>
          ) : (
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
            >
              <View className="p-5">
                <PropertyImageCarousel
                  images={displayImages}
                  isFeatured={property.isFeatured}
                />

                <PropertyPriceViewsRow
                  price={property.price}
                  createdAt={publishedDate(property) ?? property.createdAt}
                  views={property.views}
                />

                <PropertySpecsRow
                  areaSize={property.areaSize}
                  area={property.area}
                  floors={property.floors}
                  beds={property.beds}
                  baths={property.baths}
                />

                <PropertyAdditionalDetails
                  location={property.location}
                  propertyIncome={property.propertyIncome}
                  licenseNumber={property.licenseNumber}
                />

                <PropertyDescriptionSection
                  description={property.description}
                />

                <PropertyContactActionsBar
                  onCall={handleCall}
                  onWhatsApp={handleWhatsApp}
                  onChat={handleChat}
                />

                {/* View Property CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onViewProperty}
                  className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
                >
                  <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
                    عرض العقار
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomSheetScrollView>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

PropertyDetailsSheet.displayName = 'PropertyDetailsSheet';

export default PropertyDetailsSheet;
