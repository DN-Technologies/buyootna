import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
// Import our reusable UI components from the Filters epic
import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import StepperInput from '@/core/components/filters/StepperInput';
import MapPickerModal from '@/core/components/MapPickerModal';
// Import the Zustand store
import { useListingStore } from '@/core/store/useListingStore';
// Import real location data
import { AREAS, GOVERNORATES } from '@/core/utils/data/locations';

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

export default function SharedPropertyInfo() {
  // 1. Pull data and actions from the Zustand Store
  const {
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
    isEdit,
    updateField,
  } = useListingStore();

  const [showMapPicker, setShowMapPicker] = useState(false);

  // 2. Refs for the Bottom Sheet Drawers
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);
  const categoryDrawerRef = useRef<BottomSheetModal>(null);

  // 3. Dynamic area list based on the selected governorate
  const filteredAreas = governorate ? AREAS[governorate.id] || [] : [];

  const handleMapPress = () => {
    setShowMapPicker(true);
  };

  const handleClearMap = () => {
    updateField('mapLocation', null);
    updateField('mapLocationLabel', null);
  };

  const handleGovernorateSelect = (item: { id: string; label: string }) => {
    updateField('governorate', item);
    // Reset the area when governorate changes since areas are dependent
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
              Alert.alert('تنبيه', 'يرجى اختيار المحافظة أولاً', [
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
          الموقع على الخريطة
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleMapPress}
          className="h-12 flex-row items-center justify-between rounded-xl border border-[#ECECEC] bg-white px-4"
        >
          {/* Location Text (Right side in RTL) */}
          <Text
            className={`flex-1 font-cairo ${mapLocationLabel || mapLocation ? 'text-[#111111]' : 'text-[#D1D5DB]'}`}
            style={{ writingDirection: 'rtl' }}
          >
            {mapLocationLabel
              ? mapLocationLabel
              : mapLocation
                ? mapLocation
                : 'حدد الموقع على الخريطة'}
          </Text>

          {/* Map Icon (Left side in RTL) */}
          <TouchableOpacity onPress={handleClearMap} className="p-1">
            <Feather name="map" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* --- 3. Category & Area Size Row --- */}
      <View className="mb-2 w-full flex-row gap-3" style={{ gap: 12 }}>
        <DrawerTrigger
          label="فئة العقار"
          placeholder="اختر فئة العقار"
          value={propertyCategory?.label}
          onPress={() => categoryDrawerRef.current?.present()}
          required={true}
          disabled={isEdit && !!propertyCategory}
          locked={isEdit && !!propertyCategory}
        />

        {/* Area Size Text Input */}
        <View className="mb-6 flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{
              writingDirection: 'rtl',
            }}
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
              placeholder="300"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={areaSize}
              onChangeText={(text) => updateField('areaSize', text)}
              editable={!isEdit || !areaSize}
            />
            <View className="flex-row items-center gap-1.5">
              <Text className="font-cairo-medium text-xs text-[#94A3B8]">م²</Text>
              {(isEdit && !!areaSize) && <LockIcon size={14} color="#94A3B8" />}
            </View>
          </View>
        </View>
      </View>

      {/* --- 4. Automated Property Number --- */}
      <View className="mb-6 w-full flex-row gap-3" style={{ gap: 12 }}>
        {/* Property Age */}
        <View className="mb-6 flex-1" style={{ flex: 1 }}>
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
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={propertyAge}
              onChangeText={(text) => updateField('propertyAge', text)}
            />
          </View>
        </View>

        {/* Automated Number */}
        <View className="mb-6 flex-1" style={{ flex: 1 }}>
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
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={automatedNumber}
              onChangeText={(text) => updateField('automatedNumber', text)}
            />
            <Image
              source={require('@/assets/icons/add-listing/automated-number.png')}
              style={{ width: 17, height: 16 }}
            />
          </View>
        </View>
      </View>

      {/* --- 5. Steppers Row (Rooms & Baths & Floors) --- */}
      <View className="mb-2 w-full flex-row gap-3">
        {propertyCategory?.id !== 'apartment' && (
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

      {/* --- Drawers (Rendered invisibly at the bottom of the component) --- */}
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
          />
        );
      })()}
    </View>
  );
}
