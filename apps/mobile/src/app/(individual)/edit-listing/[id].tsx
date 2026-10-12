import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedPropertyInfo from '@/app/(individual)/add-listing/SharedPropertyInfo';
import ExchangePropertyTab from '@/app/(individual)/add-listing/tabs/ExchangePropertyTab';
import RentPropertyTab from '@/app/(individual)/add-listing/tabs/RentPropertyTab';
import SellPropertyTab from '@/app/(individual)/add-listing/tabs/SellPropertyTab';
import DiscardChangesSheet from '@/shared/components/add-listing/DiscardChangesSheet';
import ImageUploadZone from '@/shared/components/add-listing/ImageUploadZone';
import EditListingFooter from '@/shared/components/edit-listing/EditListingFooter';
import EditListingHeader from '@/shared/components/edit-listing/EditListingHeader';
import LockedAdTypeSection from '@/shared/components/edit-listing/LockedAdTypeSection';
import SaveLoadingOverlay from '@/shared/components/edit-listing/SaveLoadingOverlay';
import { useEditListing } from '@/shared/hooks/properties/useEditListing';

/** Edit an ad. The flow lives in useEditListing; this lays the form out. */
export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const edit = useEditListing(id);
  const { listingType } = edit;

  if (edit.isLoading) {
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
        <SaveLoadingOverlay visible={edit.saveLoading} />

        <EditListingHeader onBack={edit.goBack} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View className="px-4 pt-2" style={{ gap: 24 }}>
            <LockedAdTypeSection listingType={listingType} />

            <SharedPropertyInfo />

            {/* Price & details, by listing type */}
            {listingType === 'sell' && <SellPropertyTab />}
            {listingType === 'rent' && <RentPropertyTab />}
            {listingType === 'exchange' && <ExchangePropertyTab />}

            <ImageUploadZone />
          </View>
        </ScrollView>

        <EditListingFooter isButtonActive={edit.canSave} onSave={edit.save} />

        <DiscardChangesSheet
          ref={edit.discardSheetRef}
          onCancel={edit.keepEditing}
          onConfirm={edit.discardChanges}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
