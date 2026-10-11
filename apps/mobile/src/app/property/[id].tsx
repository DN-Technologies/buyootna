import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DeleteConfirmationSheet from '@/features/individual/components/activity/DeleteConfirmationSheet';
import RepublishAdSheet, {
  RepublishPlanType,
} from '@/features/individual/components/activity/RepublishAdSheet';
import apiClient from '@/shared/api/api';
import { plansService } from '@/shared/api/plans.service';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import ArchivedPropertyActionBar from '@/shared/components/property/ArchivedPropertyActionBar';
import PropertyActionBar from '@/shared/components/property/PropertyActionBar';
import PropertyDetailsContent from '@/shared/components/property/PropertyDetailsContent';
import PropertyErrorState from '@/shared/components/property/PropertyErrorState';
import PropertyDetailSkeleton from '@/shared/components/skeletons/PropertyDetailSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useAuthGuard } from '@/shared/hooks/auth/useAuthGuard';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';
import { renewProperty, useMyActivity } from '@/shared/hooks/properties/useMyActivity';
import { usePropertyActions } from '@/shared/hooks/properties/usePropertyActions';
import { usePropertyDetails } from '@/shared/hooks/properties/usePropertyDetails';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

export default function PropertyDetailsScreen() {
  const { id, archived } = useLocalSearchParams<{
    id: string;
    archived?: string;
  }>();
  const propertyId = String(id);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { guardAction, authSheetRef } = useAuthGuard();
  const { isFavorited, toggleFavorite } = useFavorites();

  const { property, isLoading, isError } = usePropertyDetails(propertyId);
  const { freeAdsRemaining, subscription } = useMyActivity();
  const isFavorite = isFavorited(propertyId);

  const isArchived =
    archived === 'true' || (property as any)?.status === 'EXPIRED';

  // The real wallet decides what the republish sheet offers and spends
  const { data: publishOptions } = useQuery({
    queryKey: ['publishOptions'],
    queryFn: plansService.getPublishOptions,
    enabled: isArchived,
  });

  const republishSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [isRepublishing, setIsRepublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    handleWhatsapp,
    canWhatsapp,
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

  const handleOpenRepublish = () => {
    republishSheetRef.current?.present();
  };

  const handleOpenDelete = () => {
    deleteSheetRef.current?.present();
  };

  const handleConfirmRepublish = async (
    _planType?: RepublishPlanType,
    planSlotId?: string,
  ) => {
    try {
      setIsRepublishing(true);
      // Spend exactly the credit the user picked (featured or regular)
      await renewProperty(propertyId, planSlotId);
      queryClient.invalidateQueries({ queryKey: ['myActivity'] });
      queryClient.invalidateQueries({ queryKey: ['publishOptions'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      // It's live again with a fresh publish date: the home lists show it
      for (const key of [
        'homeProperties',
        'saleProperties',
        'rentProperties',
        'exchangeProperties',
      ]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      showAlert('نجاح', 'تمت إعادة نشر الإعلان بنجاح');
      router.back();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في إعادة نشر الإعلان'));
    } finally {
      setIsRepublishing(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/properties/${propertyId}`);
      queryClient.invalidateQueries({ queryKey: ['myActivity'] });
      showAlert('نجاح', 'تم حذف الإعلان بنجاح');
      router.back();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف الإعلان'));
    } finally {
      setIsDeleting(false);
    }
  };

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
        {isArchived ? (
          <ArchivedPropertyActionBar
            insets={insets}
            onDelete={handleOpenDelete}
            onRepublish={handleOpenRepublish}
            isRepublishing={isRepublishing}
            isDeleting={isDeleting}
          />
        ) : (
          <PropertyActionBar
            insets={insets}
            onWhatsapp={canWhatsapp ? handleWhatsapp : undefined}
            onCall={handleCall}
            onChat={handleChat}
          />
        )}
      </ContentContainer>

      {/* --- Auth Guard Bottom Sheet --- */}
      <AuthGuardSheet ref={authSheetRef} />

      {/* --- Republish Ad Bottom Sheet (Archived ads) --- */}
      <RepublishAdSheet
        ref={republishSheetRef}
        freeAdsRemaining={freeAdsRemaining}
        subscription={subscription}
        publishOptions={publishOptions?.options}
        onConfirm={handleConfirmRepublish}
        isLoading={isRepublishing}
      />

      {/* --- Delete Confirmation Bottom Sheet (Archived ads) --- */}
      <DeleteConfirmationSheet
        ref={deleteSheetRef}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف هذا الإعلان؟"
        description="سيتم حذف هذا الإعلان نهائياً ولن تتمكن من استعادته لاحقاً"
        confirmLabel="حذف الإعلان"
        skipReasonStep
      />
    </View>
  );
}
