import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImageDropzone } from './ImageDropzone';
import { ListingTypeSelector } from './ListingTypeSelector';
import OfficeAddTopBar from './OfficeAddTopBar';
import OfficePickerModal from './OfficePickerModal';
import OfficePriceDetailsSection from './OfficePriceDetailsSection';
import OfficePropertyInfoSection from './OfficePropertyInfoSection';
import { useOfficeAddListing } from './useOfficeAddListing';

/**
 * The office persona's إضافة إعلان screen. All state lives in
 * useOfficeAddListing; each section below lays out its part of it.
 */
export default function OfficeAddListingScreen() {
  const office = useOfficeAddListing();

  return (
    <SafeAreaView className="flex-1 bg-white" testID="office-add-screen">
      <OfficeAddTopBar
        onBack={office.goBack}
        onMapPress={office.showMapInfoAlert}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130 }}
          className="flex-1 pt-4"
        >
          {/* نوع الإعلان */}
          <View className="mb-6">
            <ListingTypeSelector
              value={office.listingType}
              onChange={office.setListingType}
            />
          </View>

          <OfficePropertyInfoSection office={office} />

          <OfficePriceDetailsSection office={office} />

          {/* الصور */}
          <View className="mb-6">
            <ImageDropzone images={office.images} onChange={office.setImages} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky bottom CTA */}
      <View className="w-full border-t border-[#ECECEC] bg-white px-4 py-3 pb-8">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={office.handlePreviewAd}
          disabled={!office.isFormValid}
          className={`h-12 w-full items-center justify-center rounded-full ${
            office.isFormValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
          }`}
          testID="button-preview-ad"
        >
          <Text className="font-cairo-semibold text-sm text-white">
            معاينة الاعلان
          </Text>
        </TouchableOpacity>
      </View>

      <OfficePickerModal
        visible={office.activePicker !== null}
        title={office.pickerTitle}
        options={office.pickerOptions}
        onSelect={office.selectPickerItem}
        onClose={() => office.setActivePicker(null)}
      />
    </SafeAreaView>
  );
}
