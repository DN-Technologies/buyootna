import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

// Import our reusable UI components from the Filters epic
import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import StepperInput from '@/core/components/filters/StepperInput';
// Import the Zustand store
import { useListingStore } from '@/core/store/useListingStore';

// --- Mock Data ---
const MOCK_GOVERNORATES = [
  { id: '1', label: 'العاصمة' },
  { id: '2', label: 'حولي' },
  { id: '3', label: 'الأحمدي' },
];

const MOCK_AREAS = [
  { id: '1', label: 'السالمية' },
  { id: '2', label: 'الجابرية' },
  { id: '3', label: 'سلوى' },
];

const CATEGORY_OPTIONS = [
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'بيت' },
  { id: 'villa', label: 'فيلا' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
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
    mapLocation,
    propertyAge,
    updateField,
  } = useListingStore();

  // 2. Refs for the Bottom Sheet Drawers
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);
  const categoryDrawerRef = useRef<BottomSheetModal>(null);

  const handleMapPress = () => {
    // Logic to open Map Screen/Modal goes here
    console.log('Open map to select location');
  };

  const handleClearMap = () => {
    updateField('mapLocation', null);
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
        />
        <DrawerTrigger
          label="المنطقة"
          placeholder="اختر المنطقة"
          value={area?.label}
          onPress={() => areaDrawerRef.current?.present()}
        />
      </View>

      {/* --- 2. Map Location Row (NEW) --- */}
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
          className="h-12 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4"
        >
          {/* Location Text (Right side in RTL) */}
          <Text
            className={`flex-1 font-cairo ${mapLocation ? 'text-[#111111]' : 'text-[#D1D5DB]'}`}
            style={{ writingDirection: 'rtl' }}
          >
            {mapLocation ? mapLocation : 'حدد الموقع على الخريطة'}
          </Text>

          {/* Trash Icon (Left side in RTL) */}
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
        />

        {/* Area Size Text Input */}
        <View className="mb-6 flex-1" style={{ flex: 1 }}>
          <Text
            className="mb-1 font-cairo-medium text-sm text-[#111111]"
            style={{
              writingDirection: 'rtl',
            }}
          >
            المساحة
          </Text>
          <View
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
            style={{ width: '100%' }}
          >
            <TextInput
              className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
              style={{ flex: 1, textAlign: 'right' }}
              placeholder="300"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={areaSize}
              onChangeText={(text) => updateField('areaSize', text)}
            />
            <Text className="font-cairo-medium text-xs text-[#94A3B8]">م²</Text>
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
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
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
            className="h-[40px] w-full flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
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
              source={require('@/assets/icons/add/automated-number.png')}
              style={{ width: 17, height: 16 }}
            />
          </View>
        </View>
      </View>

      {/* --- 5. Steppers Row (Rooms & Baths) --- */}
      <View className="mb-2 w-full flex-row gap-3">
        <StepperInput
          title="عدد الغرف"
          value={rooms}
          onChange={(val) => updateField('rooms', val)}
          min={0}
          max={20}
        />
        <StepperInput
          title="عدد الحمامات"
          value={baths}
          onChange={(val) => updateField('baths', val)}
          min={0}
          max={20}
        />
      </View>

      {/* --- Drawers (Rendered invisibly at the bottom of the component) --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={MOCK_GOVERNORATES}
        onSelect={(item) => updateField('governorate', item)}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={MOCK_AREAS}
        onSelect={(item) => updateField('area', item)}
      />
      <SelectionDrawer
        ref={categoryDrawerRef}
        title="اختر فئة العقار"
        data={CATEGORY_OPTIONS}
        onSelect={(item) => updateField('propertyCategory', item)}
      />
    </View>
  );
}
