import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthGuardSheet from '@/shared/components/AuthGuardSheet';
import ContentContainer from '@/shared/components/ContentContainer';
import PropertyDetailsContent from '@/shared/components/property/PropertyDetailsContent';
import PropertyErrorState from '@/shared/components/property/PropertyErrorState';
import PropertyActionBar from '@/shared/components/PropertyActionBar';
import PropertyDetailSkeleton from '@/shared/components/skeletons/PropertyDetailSkeleton';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { useFavorites } from '@/shared/hooks/useFavorites';
import { usePropertyActions } from '@/shared/hooks/usePropertyActions';
import { usePropertyDetails } from '@/shared/hooks/usePropertyDetails';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const propertyId = String(id);
  const insets = useSafeAreaInsets();
  const { guardAction, authSheetRef } = useAuthGuard();
  const { isFavorited, toggleFavorite } = useFavorites();

  const { property, isLoading, isError } = usePropertyDetails(propertyId);
  const isFavorite = isFavorited(propertyId);

  const {
    handleWhatsapp,
    handleCall,
    handleChat,
    handleShare,
    handleFavoriteToggle,
    handleHostPress,
    handleBack,
  } = usePropertyActions({
    property,
    guardAction,
    toggleFavorite,
  });

  // --- Loading State ---
  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  // --- Error / Not Found State ---
  if (isError || !property) {
    return <PropertyErrorState onBack={handleBack} />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* --- 1. Main Scrollable Content --- */}
      <PropertyDetailsContent
        property={property}
        isFavorite={isFavorite}
        insets={insets}
        onBack={handleBack}
        onFavorite={handleFavoriteToggle}
        onShare={handleShare}
        onHostPress={handleHostPress}
      />

      {/* --- 2. Fixed Bottom Action Bar --- */}
      <ContentContainer className="absolute bottom-0 z-50 w-full bg-white">
        <PropertyActionBar
          insets={insets}
          onWhatsapp={handleWhatsapp}
          onCall={handleCall}
          onChat={handleChat}
        />
      </ContentContainer>

      {/* --- Auth Guard Bottom Sheet --- */}
      <AuthGuardSheet ref={authSheetRef} />
    </View>
  );
}
