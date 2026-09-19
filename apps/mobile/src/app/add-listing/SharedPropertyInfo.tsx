import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import PropertyAgeYearsRow from '@/shared/components/add-listing/PropertyAgeYearsRow';
import PropertyAmenitiesChips from '@/shared/components/add-listing/PropertyAmenitiesChips';
import PropertyCategorySizeRow from '@/shared/components/add-listing/PropertyCategorySizeRow';
import PropertyLocationRow from '@/shared/components/add-listing/PropertyLocationRow';
import PropertyMapField from '@/shared/components/add-listing/PropertyMapField';
import PropertyStepperRow from '@/shared/components/add-listing/PropertyStepperRow';
import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import MapPickerModal from '@/shared/components/MapPickerModal';
import { useListingStore } from '@/shared/store/useListingStore';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

const CATEGORY_OPTIONS = [
  { id: 'residential', label: 'سكني' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'بيت' },
  { id: 'villa', label: 'فيلا' },
  { id: 'land', label: 'أرض' },
  { id: 'building', label: 'عمارة' },
  { id: 'chalet', label: 'شاليه' },
];

const DEFAULT_MOCK_FEATURES = [
  { id: '1', label: 'حمام سباحة' },
  { id: '2', label: 'كراج' },
  { id: '3', label: 'مصعد' },
  { id: '4', label: 'بطن وظهر' },
  { id: '5', label: 'زاوية' },
  { id: '6', label: 'شارع واحد' },
];

export default function SharedPropertyInfo() {
  const {
    listingType,
    governorate,
    area,
    propertyCategory,
    areaSize,
    automatedNumber,
    rooms,
    baths,
    floors,
    mapLocation,
    mapLocationLabel,
    propertyAge,
    requestYear,
    requiredYear,
    features,
    backendFeatures,
    isEdit,
    updateField,
  } = useListingStore();

  const [showMapPicker, setShowMapPicker] = useState(false);

  // Refs for bottom sheet drawers
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);
  const categoryDrawerRef = useRef<BottomSheetModal>(null);

  // Dynamic area list based on selected governorate
  const filteredAreas = governorate ? AREAS[governorate.id] || [] : [];

  // Active feature list
  const activeFeatures =
    (listingType === 'sell'
      ? backendFeatures?.sell
      : listingType === 'rent'
        ? backendFeatures?.rent
        : backendFeatures?.exchange) || DEFAULT_MOCK_FEATURES;

  const handleGovernorateSelect = (item: { id: string; label: string }) => {
    updateField('governorate', item);
    updateField('area', null);
  };

  const handleToggleFeature = (label: string) => {
    const currentFeatures = features || [];
    updateField(
      'features',
      currentFeatures.includes(label)
        ? currentFeatures.filter((f) => f !== label)
        : [...currentFeatures, label],
    );
  };

  let initialLat: number | undefined;
  let initialLng: number | undefined;
  if (mapLocation && mapLocation.includes(',')) {
    const [latStr, lngStr] = mapLocation.split(',');
    initialLat = parseFloat(latStr);
    initialLng = parseFloat(lngStr);
  }

  return (
    <View className="mb-6">
      {/* --- Section Title --- */}
      <Text
        className="mb-4 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        معلومات العقار
      </Text>

      <PropertyLocationRow
        governorate={governorate}
        area={area}
        isEdit={isEdit}
        onPressGovernorate={() => govDrawerRef.current?.present()}
        onPressArea={() => areaDrawerRef.current?.present()}
      />

      <PropertyMapField
        mapLocation={mapLocation}
        mapLocationLabel={mapLocationLabel}
        onPress={() => setShowMapPicker(true)}
        onClear={() => {
          updateField('mapLocation', null);
          updateField('mapLocationLabel', null);
        }}
      />

      <PropertyCategorySizeRow
        propertyCategory={propertyCategory}
        onPressCategory={() => categoryDrawerRef.current?.present()}
        isEdit={isEdit}
        areaSize={areaSize}
        onChangeAreaSize={(value) => updateField('areaSize', value)}
      />

      <PropertyAgeYearsRow
        listingType={listingType}
        requestYear={requestYear}
        onChangeRequestYear={(value) => updateField('requestYear', value)}
        requiredYear={requiredYear}
        onChangeRequiredYear={(value) => updateField('requiredYear', value)}
        propertyAge={propertyAge}
        onChangePropertyAge={(value) => updateField('propertyAge', value)}
        automatedNumber={automatedNumber}
        onChangeAutomatedNumber={(value) => updateField('automatedNumber', value)}
      />

      <PropertyStepperRow
        listingType={listingType}
        floors={floors}
        onChangeFloors={(value) => updateField('floors', value)}
        baths={baths}
        onChangeBaths={(value) => updateField('baths', value)}
        rooms={rooms}
        onChangeRooms={(value) => updateField('rooms', value)}
      />

      <PropertyAmenitiesChips
        activeFeatures={activeFeatures}
        selectedFeatures={features}
        onToggleFeature={handleToggleFeature}
      />

      {/* --- Drawers --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        onSelect={handleGovernorateSelect}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={filteredAreas}
        onSelect={(item) => updateField('area', item)}
      />
      <SelectionDrawer
        ref={categoryDrawerRef}
        title="اختر فئة العقار"
        data={CATEGORY_OPTIONS}
        onSelect={(item) => updateField('propertyCategory', item)}
      />

      <MapPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(addressName, lat, lng) => {
          updateField('mapLocation', `${lat},${lng}`);
          updateField('mapLocationLabel', addressName);
        }}
        initialLat={initialLat}
        initialLng={initialLng}
        initialAddressLabel={mapLocationLabel || undefined}
      />
    </View>
  );
}
