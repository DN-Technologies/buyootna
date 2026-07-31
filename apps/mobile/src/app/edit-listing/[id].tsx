import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedPropertyInfo from '@/app/add-listing/SharedPropertyInfo';
import ExchangePropertyTab from '@/app/add-listing/tabs/ExchangePropertyTab';
import RentPropertyTab from '@/app/add-listing/tabs/RentPropertyTab';
import SellPropertyTab from '@/app/add-listing/tabs/SellPropertyTab';
import { propertiesService } from '@/shared/api/properties.service';
import DiscardChangesSheet from '@/shared/components/add-listing/DiscardChangesSheet';
import ImageUploadZone from '@/shared/components/add-listing/ImageUploadZone';
import EditListingFooter from '@/shared/components/edit-listing/EditListingFooter';
import EditListingHeader from '@/shared/components/edit-listing/EditListingHeader';
import LockedAdTypeSection from '@/shared/components/edit-listing/LockedAdTypeSection';
import SaveLoadingOverlay from '@/shared/components/edit-listing/SaveLoadingOverlay';
import { useListingStore } from '@/shared/store/useListingStore';
import type { PropertyDetailsDto } from '@/types/property';

export default function EditListingScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  
  const [isLoading, setIsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [initialProperty, setInitialProperty] = useState<PropertyDetailsDto | null>(null);

  const discardSheetRef = useRef<BottomSheetModal>(null);
  const [pendingNavigation, setPendingNavigation] = useState<any>(null);
  const isSavedRef = useRef(false);

  const store = useListingStore();
  const {
    listingType,
    governorate,
    area,
    propertyCategory,
    areaSize,
    adDetails,
    phoneNumber,
    price,
    showPrice,
    monthlyRent,
    requestYear,
    requiredYear,
    images,
    automatedNumber,
    propertyAge,
    rooms,
    baths,
    floors,
    features,
    populateFromProperty,
    resetForm,
    buildApiPayload,
  } = store;

  // 1. Fetch property details on mount and populate store
  useEffect(() => {
    let active = true;
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const property = await propertiesService.getPropertyById(id);
        if (active) {
          setInitialProperty(property);
          populateFromProperty(property);
        }
      } catch (error) {
        console.error('Failed to load property for editing:', error);
        Alert.alert('خطأ', 'فشل في تحميل بيانات الإعلان.', [
          { text: 'حسناً', onPress: () => router.back() },
        ]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchProperty();

    return () => {
      active = false;
      resetForm(); // Reset store on unmount
    };
  }, [id, populateFromProperty, resetForm, router]);

  // check if current store has unsaved edits
  const checkIsDirty = useCallback((): boolean => {
    if (!initialProperty) return false;

    // Ad Type
    const initialType = initialProperty.type === 'SALE' ? 'sell' : initialProperty.type === 'RENT' ? 'rent' : 'exchange';
    if (listingType !== initialType) return true;

    // Governorate & Area
    if (governorate?.id !== initialProperty.governorateId) return true;
    if (area?.id !== initialProperty.areaId) return true;

    // Category & Area Size
    const initialCategory = initialProperty.category?.toLowerCase() || '';
    const currentCategory = propertyCategory?.id || '';
    if (currentCategory !== initialCategory) return true;
    if ((parseFloat(areaSize) || 0) !== (initialProperty.areaSize || 0)) return true;

    // Automated Number & Age
    if (automatedNumber !== (initialProperty.automatedNumber || '')) return true;
    if (propertyAge !== (initialProperty.propertyAge ? initialProperty.propertyAge.toString() : '')) return true;

    // Rooms & Baths & Floors
    if (rooms !== (initialProperty.beds || 1)) return true;
    if (baths !== (initialProperty.baths || 1)) return true;
    if (floors !== (initialProperty.floors || 0)) return true;

    // Details & Contact
    if (adDetails !== (initialProperty.description || '')) return true;
    if (phoneNumber !== (initialProperty.phoneNumber || '')) return true;

    // Price / Rent / Exchange
    const initialPrice = initialProperty.price ? initialProperty.price.toString() : '';
    if (listingType === 'sell' && price !== initialPrice) return true;
    if (listingType === 'rent' && monthlyRent !== initialPrice) return true;
    if (listingType === 'exchange' && price !== initialPrice) return true;

    // Price toggle
    const hasInitialPrice = initialProperty.price !== null && initialProperty.price !== undefined;
    if (showPrice !== hasInitialPrice) return true;

    // Exchange years
    if (listingType === 'exchange') {
      const initialRequestYear = initialProperty.requestYear ? initialProperty.requestYear.toString() : '';
      const initialRequiredYear = initialProperty.requiredYear ? initialProperty.requiredYear.toString() : '';
      if (requestYear !== initialRequestYear) return true;
      if (requiredYear !== initialRequiredYear) return true;
    }

    // Features
    const initialFeatures = initialProperty.features
      ? (initialProperty.features as any[]).map((f: any) => f.label || f)
      : [];
    if (features.length !== initialFeatures.length) return true;
    const featuresMatch = features.every((f: string) => initialFeatures.includes(f));
    if (!featuresMatch) return true;

    // Images
    const initialImages = initialProperty.images || [];
    if (images.length !== initialImages.length) return true;
    const imagesMatch = images.every((img: string) => initialImages.includes(img));
    if (!imagesMatch) return true;

    return false;
  }, [
    initialProperty,
    listingType,
    governorate,
    area,
    propertyCategory,
    areaSize,
    automatedNumber,
    propertyAge,
    rooms,
    baths,
    floors,
    adDetails,
    phoneNumber,
    price,
    monthlyRent,
    requestYear,
    requiredYear,
    showPrice,
    features,
    images,
  ]);

  // Intercept back navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (saveLoading || isSavedRef.current) {
        return;
      }

      const isDirty = checkIsDirty();
      if (!isDirty) {
        return;
      }

      e.preventDefault();
      setPendingNavigation(e.data.action);
      discardSheetRef.current?.present();
    });

    return unsubscribe;
  }, [navigation, saveLoading, checkIsDirty]);

  // 2. Validate form inputs
  const isBaseValid =
    !!governorate &&
    !!area &&
    !!propertyCategory &&
    !!areaSize &&
    !!adDetails &&
    !!phoneNumber;

  let isTypeValid = true;
  if (listingType === 'sell') {
    isTypeValid = !showPrice || !!price;
  } else if (listingType === 'rent') {
    isTypeValid = !showPrice || !!monthlyRent;
  } else if (listingType === 'exchange') {
    isTypeValid = !!requestYear && !!requiredYear;
  }

  const isFormValid = isBaseValid && isTypeValid;
  const isDirty = checkIsDirty();
  const isButtonActive = isFormValid && isDirty && !saveLoading;

  // 3. Handle save/submit edit action
  const handleSave = async () => {
    if (!id) return;
    try {
      setSaveLoading(true);

      // Separate pre-existing absolute URLs from newly picked local URIs
      const existingUrls = images.filter(
        (uri) => uri.startsWith('http://') || uri.startsWith('https://'),
      );
      const localUris = images.filter(
        (uri) => !uri.startsWith('http://') && !uri.startsWith('https://'),
      );

      // Upload newly added local images (if any)
      let uploadedUrls: string[] = [];
      if (localUris.length > 0) {
        uploadedUrls = await propertiesService.uploadImages(localUris);
      }

      // Merge existing S3 URLs and newly uploaded S3 URLs
      const combinedUrls = [...existingUrls, ...uploadedUrls];

      // Compile update payload
      const payload = buildApiPayload(false, combinedUrls);

      // Call update API
      await propertiesService.updateProperty(id, payload);

      isSavedRef.current = true;
      resetForm();
      router.replace({
        pathname: '/activity',
        params: { showUpdateSuccess: 'true' },
      });
    } catch (error) {
      console.error('Failed to update property listing:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تعديل الإعلان. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#15304D" />
        <Text className="mt-4 font-cairo text-sm text-gray-500">
          جاري تحميل بيانات الإعلان...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Loading Overlay */}
        <SaveLoadingOverlay visible={saveLoading} />

        {/* Header */}
        <EditListingHeader onBack={() => router.back()} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View className="px-5 pt-2">
            {/* Locked Ad Type Section */}
            <LockedAdTypeSection listingType={listingType} />

            {/* Form Fields */}
            <View>
              <SharedPropertyInfo />

              {/* Conditional Tabs */}
              {listingType === 'sell' && <SellPropertyTab />}
              {listingType === 'rent' && <RentPropertyTab />}
              {listingType === 'exchange' && <ExchangePropertyTab />}
            </View>

            {/* Image Upload Zone */}
            <ImageUploadZone />
          </View>
        </ScrollView>

        {/* Sticky Footer Action */}
        <EditListingFooter
          isButtonActive={isButtonActive}
          onSave={handleSave}
        />

        <DiscardChangesSheet
          ref={discardSheetRef}
          onCancel={() => {
            discardSheetRef.current?.dismiss();
            setPendingNavigation(null);
          }}
          onConfirm={() => {
            discardSheetRef.current?.dismiss();
            if (pendingNavigation) {
              navigation.dispatch(pendingNavigation);
            }
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
