import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NavigationAction } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { propertiesService } from '@/shared/api/properties.service';
import {
  isListingFormValid,
  useListingStore,
} from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';
import { hasListingChanges } from '@/shared/utils/listingChanges';

const isRemoteUrl = (uri: string) =>
  uri.startsWith('http://') || uri.startsWith('https://');

/**
 * The edit-ad screen's flow: load the ad into the listing form, guard
 * against leaving with unsaved changes, and save.
 */
export function useEditListing(id: string | undefined) {
  const router = useRouter();
  const navigation = useNavigation();
  const form = useListingStore();
  const { populateFromProperty, resetForm, buildApiPayload, images } = form;

  const [saveLoading, setSaveLoading] = useState(false);
  const isSavedRef = useRef(false);
  const discardSheetRef = useRef<BottomSheetModal>(null);
  const [pendingNavigation, setPendingNavigation] =
    useState<NavigationAction | null>(null);

  // 1. Load the ad and fill the form with it
  const {
    data: initialProperty = null,
    isLoading,
    isError: loadError,
  } = useQuery({
    queryKey: ['editListingProperty', id],
    queryFn: () => propertiesService.getPropertyById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (initialProperty) populateFromProperty(initialProperty);
  }, [initialProperty, populateFromProperty]);

  useEffect(() => {
    if (loadError) {
      console.error('Failed to load property for editing');
      showAlert('خطأ', 'فشل في تحميل بيانات الإعلان.', [
        { text: 'حسناً', onPress: () => router.back() },
      ]);
    }
  }, [loadError, router]);

  // The form is shared with the add-ad flow: leave it clean
  useEffect(() => resetForm, [resetForm]);

  const isDirty = !!initialProperty && hasListingChanges(form, initialProperty);
  // The latest value for the navigation listener, without re-subscribing
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // 2. Leaving with unsaved changes asks first
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (saveLoading || isSavedRef.current || !isDirtyRef.current) return;

      e.preventDefault();
      setPendingNavigation(e.data.action);
      discardSheetRef.current?.present();
    });
  }, [navigation, saveLoading]);

  const keepEditing = () => {
    discardSheetRef.current?.dismiss();
    setPendingNavigation(null);
  };

  const discardChanges = () => {
    discardSheetRef.current?.dismiss();
    if (pendingNavigation) navigation.dispatch(pendingNavigation);
  };

  // 3. Save: upload newly picked images, then update the ad
  const save = async () => {
    if (!id) return;
    try {
      setSaveLoading(true);

      const localUris = images.filter((uri) => !isRemoteUrl(uri));
      const uploadedUrls =
        localUris.length > 0
          ? await propertiesService.uploadImages(localUris)
          : [];
      const payload = buildApiPayload(false, [
        ...images.filter(isRemoteUrl),
        ...uploadedUrls,
      ]);

      await propertiesService.updateProperty(id, payload);

      isSavedRef.current = true;
      resetForm();
      router.replace({
        pathname: '/activity',
        params: { showUpdateSuccess: 'true' },
      });
    } catch (error) {
      console.error('Failed to update property listing:', error);
      showAlert('خطأ', 'حدث خطأ أثناء تعديل الإعلان. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    listingType: form.listingType,
    isLoading,
    saveLoading,
    canSave: isListingFormValid(form) && isDirty && !saveLoading,
    save,
    goBack: () => router.back(),
    discardSheetRef,
    keepEditing,
    discardChanges,
  };
}
