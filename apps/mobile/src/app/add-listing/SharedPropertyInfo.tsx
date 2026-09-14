import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import StepperInput from '@/shared/components/filters/StepperInput';
import MapPickerModal from '@/shared/components/MapPickerModal';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';
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

  const handleMapPress = () => {
    setShowMapPicker(true);
  };

  const handleClearMap = () => {
    updateField('mapLocation', null);
    updateField('mapLocationLabel', null);
  };

  const handleGovernorateSelect = (item: { id: string; label: string }) => {
    updateField('governorate', item);
    updateField('area', null);
  };

  return (
    <View className="mb-6">
      {/* --- Section Title --- */}
      <Text
        className="mb-4 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        معلومات العقار
      </Text>

      {/* --- 1. Location Row (Governorate & Area) --- */}
      <View className="mb-2 w-full flex-row gap-3" style={{ gap: 12 }}>
        <DrawerTrigger
          label="المحافظة"
          placeholder="اختر المحافظة"
          value={governorate?.label}
          onPress={() => govDrawerRef.current?.present()}
          required={true}
          disabled={isEdit && !!governorate}
          locked={isEdit && !!governorate}
        />
        <DrawerTrigger
          label="المنطقة"
          placeholder="اختر المنطقة"
          value={area?.label}
          onPress={() => {
            if (!governorate) {
              showAlert('تنبيه', 'يرجى اختيار المحافظة أولاً', [
                { text: 'حسناً' },
              ]);
              return;
            }
            areaDrawerRef.current?.present();
          }}
          required={true}
          disabled={isEdit && !!area}
          locked={isEdit && !!area}
        />
      </View>

      {/* --- 2. Map Location Row --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-2 font-cairo-semibold text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          الموقع على الخريطة <Text className="text-red-500">*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleMapPress}
          className="h-12 flex-row items-center justify-between rounded-xl border border-[#ECECEC] bg-white px-4"
        >
          {/* Location Text */}
          <Text
            className={`flex-1 font-cairo text-[14px] ${mapLocationLabel || mapLocation ? 'text-[#111111]' : 'text-[#94A3B8]'}`}
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {mapLocationLabel
              ? mapLocationLabel
              : mapLocation
                ? mapLocation
                : 'حدد الموقع على الخريطة'}
          </Text>

          {/* Map Icon or Clear Button */}
          {mapLocationLabel || mapLocation ? (
            <TouchableOpacity onPress={handleClearMap} className="p-1">
              <Feather name="x-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <View className="p-1">
              <Feather name="map-pin" size={18} color="#15304D" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* --- 3. Category & Area Size Row --- */}
      <View className="mb-2 w-full flex-row gap-3" style={{ gap: 12 }}>
        <DrawerTrigger
          label="فئة العقار"
          placeholder="اختر نوع عقارك"
          value={propertyCategory?.label}
          onPress={() => categoryDrawerRef.current?.present()}
          required={true}
          disabled={isEdit && !!propertyCategory}
          locked={isEdit && !!propertyCategory}
        />

        {/* Area Size */}
        <View className="mb-6 flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            المساحة <Text className="text-red-500">*</Text>
          </Text>
          <View
            className={`h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] px-4 py-3 ${isEdit ? 'bg-gray-50' : 'bg-white'}`}
            style={{ width: '100%', gap: 8 }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="300 م2"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={areaSize}
              onChangeText={(text) => updateField('areaSize', toWesternDigits(text))}
              editable={!isEdit || !areaSize}
            />
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo-medium text-xs text-[#94A3B8]">م²</Text>
              {isEdit && !!areaSize && <LockIcon size={14} color="#94A3B8" />}
            </View>
          </View>
        </View>
      </View>

      {/* --- 4. Age & PACI OR Exchange Years --- */}
      {listingType === 'exchange' ? (
        <View className="mb-4 w-full flex-row gap-3" style={{ gap: 12 }}>
          {/* Request Year */}
          <View className="flex-1" style={{ flex: 1 }}>
            <Text
              className="mb-1 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              سنة الطلب <Text className="text-red-500">*</Text>
            </Text>
            <View
              className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
              style={{ width: '100%' }}
            >
              <TextInput
                className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
                style={{ flex: 1, textAlign: 'right' }}
                placeholder="2019"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={requestYear}
                onChangeText={(text) => updateField('requestYear', toWesternDigits(text))}
              />
            </View>
          </View>

          {/* Desired Year */}
          <View className="flex-1" style={{ flex: 1 }}>
            <Text
              className="mb-1 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              السنة المطلوبة <Text className="text-red-500">*</Text>
            </Text>
            <View
              className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
              style={{ width: '100%' }}
            >
              <TextInput
                className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
                style={{ flex: 1, textAlign: 'right' }}
                placeholder="2025"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={requiredYear}
                onChangeText={(text) => updateField('requiredYear', toWesternDigits(text))}
              />
            </View>
          </View>
        </View>
      ) : (
        <View className="mb-4 w-full flex-row gap-3" style={{ gap: 12 }}>
          {/* Property Age */}
          <View className="flex-1" style={{ flex: 1 }}>
            <Text
              className="mb-1 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              عمر العقار
            </Text>
            <View
              className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
              style={{ width: '100%' }}
            >
              <TextInput
                className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
                style={{ flex: 1, textAlign: 'right' }}
                placeholder="السنين"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={propertyAge}
                onChangeText={(text) => updateField('propertyAge', toWesternDigits(text))}
              />
            </View>
          </View>

          {/* Automated Number (PACI) */}
          <View className="flex-1" style={{ flex: 1 }}>
            <Text
              className="mb-1 font-cairo-medium text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الرقم الالي للعقار
            </Text>
            <View
              className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
              style={{ width: '100%' }}
            >
              <TextInput
                className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
                style={{ flex: 1, textAlign: 'right' }}
                placeholder="768954093"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={automatedNumber}
                onChangeText={(text) => updateField('automatedNumber', toWesternDigits(text))}
              />
              <Image
                source={require('@/assets/icons/add-listing/automated-number.png')}
                style={{ width: 17, height: 16 }}
                contentFit="contain"
              />
            </View>
          </View>
        </View>
      )}

      {/* --- 5. Steppers Row --- */}
      <View className="mb-4 w-full flex-row gap-3">
        {listingType !== 'sell' && (
          <StepperInput
            title="عدد الادوار"
            value={floors}
            onChange={(val) => updateField('floors', val)}
            min={0}
            max={20}
          />
        )}
        <StepperInput
          title="عدد الحمامات"
          value={baths}
          onChange={(val) => updateField('baths', val)}
          min={0}
          max={20}
        />
        <StepperInput
          title="عدد الغرف"
          value={rooms}
          onChange={(val) => updateField('rooms', val)}
          min={0}
          max={20}
        />
      </View>

      {/* --- 6. Amenities Chips (المزايا) --- */}
      <View className="mt-2 mb-2 w-full">
        <Text
          className="mb-3 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المزايا
        </Text>
        <View className="flex-row flex-wrap justify-start gap-2">
          {activeFeatures.map((feature) => {
            const isSelected = features?.includes(feature.label);
            return (
              <TouchableOpacity
                key={feature.id}
                onPress={() => {
                  const currentFeatures = features || [];
                  if (isSelected) {
                    updateField(
                      'features',
                      currentFeatures.filter((f) => f !== feature.label),
                    );
                  } else {
                    updateField('features', [...currentFeatures, feature.label]);
                  }
                }}
                activeOpacity={0.7}
                className={`mb-2 rounded-full border px-5 py-1.5 ${
                  isSelected
                    ? 'border-[#15304D] bg-[#F4F8FB]'
                    : 'border-transparent bg-[#F5F7F9]'
                }`}
              >
                <Text
                  className={`font-cairo text-[13px] ${
                    isSelected
                      ? 'font-cairo-semibold text-[#15304D]'
                      : 'text-[#6B6A6A]'
                  }`}
                >
                  {feature.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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

      {(() => {
        let initialLat: number | undefined;
        let initialLng: number | undefined;
        if (mapLocation && mapLocation.includes(',')) {
          const [latStr, lngStr] = mapLocation.split(',');
          initialLat = parseFloat(latStr);
          initialLng = parseFloat(lngStr);
        }
        return (
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
        );
      })()}
    </View>
  );
}
