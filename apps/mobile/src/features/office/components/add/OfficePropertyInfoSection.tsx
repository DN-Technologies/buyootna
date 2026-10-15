import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import CategoryDetailsFields from '@/shared/components/add-listing/CategoryDetailsFields';

import { NumberStepper } from './NumberStepper';
import {
  OfficeField,
  OfficePickerField,
  OfficeSectionTitle,
  OfficeTextField,
} from './OfficeFormFields';
import { OrientationDropdown } from './OrientationDropdown';
import type { OfficeAddListing } from './useOfficeAddListing';

interface SectionProps {
  office: OfficeAddListing;
}

/** سنة الطلب / السنة المطلوبة on exchange ads, else the PACI number and age. */
function YearsOrAgeRow({ office }: SectionProps) {
  if (office.listingType === 'exchange') {
    return (
      <View className="w-full flex-row gap-2">
        <OfficeTextField
          flex
          label="سنة الطلب *"
          value={office.requestYear}
          onChangeText={office.setRequestYear}
          placeholder="2019"
          keyboardType="numeric"
          testID="input-request-year"
        />
        <OfficeTextField
          flex
          label="السنة المطلوبة *"
          value={office.requiredYear}
          onChangeText={office.setRequiredYear}
          placeholder="2025"
          keyboardType="numeric"
          testID="input-required-year"
        />
      </View>
    );
  }

  return (
    <View className="w-full flex-row gap-2">
      <OfficeTextField
        flex
        required
        label="الرقم الالي للعقار"
        value={office.paciNumber}
        onChangeText={office.setPaciNumber}
        placeholder="768954093"
        keyboardType="numeric"
        testID="input-paci"
      />
      {/* Land and farms have no age */}
      {office.categoryFields.propertyAge && (
        <OfficeTextField
          flex
          required
          label="عمر العقار"
          value={office.propertyAge}
          onChangeText={office.setPropertyAge}
          placeholder="السنين"
          testID="input-age"
        />
      )}
    </View>
  );
}

/**
 * The count steppers. Which ones show depends on the category (land and
 * farms have none), as in the individual flow.
 */
function CountSteppers({ office }: SectionProps) {
  const { rooms, baths, floors } = office.categoryFields;
  if (!rooms && !baths && !floors) return null;

  return (
    <View className="w-full flex-col gap-3">
      {floors && (
        <View className="w-full">
          <NumberStepper
            label="عدد الادوار"
            value={office.floorsCount}
            onChange={office.setFloorsCount}
            testID="stepper-floors"
          />
        </View>
      )}

      <View className="w-full flex-row gap-2">
        {baths && (
          <NumberStepper
            label="عدد الحمامات"
            value={office.bathroomsCount}
            onChange={office.setBathroomsCount}
            testID="stepper-bathrooms"
          />
        )}
        {rooms && (
          <NumberStepper
            label="عدد الغرف"
            value={office.roomsCount}
            onChange={office.setRoomsCount}
            testID="stepper-rooms"
          />
        )}
      </View>
    </View>
  );
}

/** معلومات العقار: location, category, size, years/age, counts, frontage. */
export default function OfficePropertyInfoSection({ office }: SectionProps) {
  return (
    <View className="mb-6 flex-col gap-4" testID="property-info-section">
      <OfficeSectionTitle>معلومات العقار</OfficeSectionTitle>

      <View className="w-full flex-row gap-2">
        <OfficeTextField
          flex
          required
          label="المنطقة"
          value={office.area}
          onChangeText={office.setArea}
          placeholder="اختر المنطقة"
          testID="input-area"
        />
        <OfficePickerField
          flex
          required
          label="المحافظة"
          value={office.governorate}
          placeholder="اختر المحافظة"
          onPress={() => office.setActivePicker('governorate')}
          testID="picker-governorate"
        />
      </View>

      <OfficeField label="الموقع على الخريطة" required>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={office.showMapLocationAlert}
          className="h-[46px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3"
          testID="button-map-location"
        >
          <Ionicons name="location-outline" size={18} color="#15304D" />
          <Text className="font-cairo-regular text-sm text-[#979797]">
            {office.mapLocation || 'حدد الموقع على الخريطة'}
          </Text>
        </TouchableOpacity>
      </OfficeField>

      <View className="w-full flex-row gap-2">
        <OfficeTextField
          flex
          required
          label="المساحة"
          value={office.space}
          onChangeText={office.setSpace}
          placeholder="300 م2"
          testID="input-space"
        />
        <OfficePickerField
          flex
          required
          label="فئة العقار"
          value={office.category}
          placeholder="اختر نوع عقارك"
          onPress={() => office.setActivePicker('category')}
          testID="picker-category"
        />
      </View>

      <YearsOrAgeRow office={office} />

      <CountSteppers office={office} />

      {/* What the category adds (the same block as the individual form) */}
      <CategoryDetailsFields />

      {/* Frontage / Orientation Dropdown (Figma 4494:141814 & 4494:142357) */}
      <View className="w-full">
        <OrientationDropdown
          value={office.features}
          onSelect={office.setFeatures}
          testID="orientation-dropdown"
        />
        {/* Hidden/accessible input-features for full backward compatibility */}
        <TextInput
          value={office.features}
          onChangeText={office.setFeatures}
          className="hidden h-0 w-0 opacity-0"
          testID="input-features"
        />
      </View>
    </View>
  );
}
