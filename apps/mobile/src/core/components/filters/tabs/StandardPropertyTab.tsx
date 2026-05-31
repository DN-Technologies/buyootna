import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { ScrollView, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import RangeInputGroup from '@/core/components/filters/RangeInputGroup';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import StepperInput from '@/core/components/filters/StepperInput';
import { useFilterStore } from '@/core/store/useFilterStore';

// --- Mock Data matching your Figma ---
const CATEGORY_OPTIONS = [
  { id: 'investment', label: 'استثماري' },
  { id: 'house', label: 'بيت' },
  { id: 'apartment', label: 'شقة' },
  { id: 'building', label: 'عمارة' },
  { id: 'land', label: 'أرض' },
  { id: 'office', label: 'مكتب' },
  { id: 'residential', label: 'سكني' },
  { id: 'villa', label: 'فيلا' },
  { id: 'chalet', label: 'شاليه' },
];

const FEATURE_OPTIONS = [
  { id: 'garage', label: 'جراج' },
  { id: 'ac', label: 'مكيف' },
  { id: 'sea_view', label: 'إطلالة بحرية' },
  { id: 'elevator', label: 'مصعد' },
  { id: 'pool', label: 'حمام سباحة' },
];

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

export interface StandardPropertyTabProps {
  type: 'sell' | 'rent';
}

export default function StandardPropertyTab({
  type,
}: StandardPropertyTabProps) {
  // 1. Pull the state specifically for THIS tab ('sell' or 'rent')
  const tabState = useFilterStore((state) => state[type]);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // --- Drawer Refs ---
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField(type, field, value);
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {/* --- 1. Location Row (Governorate & Area) --- */}
        <View className="mb-2 w-full flex-row gap-3">
          <DrawerTrigger
            label="المحافظة"
            placeholder="اختر المحافظة"
            value={tabState.gov?.label}
            onPress={() => govDrawerRef.current?.present()}
          />
          <DrawerTrigger
            label="المنطقة"
            placeholder="اختر المنطقة"
            value={tabState.area?.label}
            onPress={() => areaDrawerRef.current?.present()}
          />
        </View>
        {/* --- 2. Property Category --- */}
        <PillGroup
          title="فئة العقار"
          options={CATEGORY_OPTIONS}
          multiSelect={false}
          value={tabState.category}
          onChange={(value) => setField('category', value)}
        />
        {/* --- 3. Steppers Row (Rooms & Baths) --- */}
        <View className="mb-6 w-full flex-row gap-3">
          <StepperInput
            title="عدد الغرف"
            value={tabState.rooms}
            onChange={(value) => setField('rooms', value)}
            min={1}
            max={10}
          />
          <StepperInput
            title="عدد الحمامات"
            value={tabState.baths}
            onChange={(value) => setField('baths', value)}
            min={1}
            max={10}
          />
        </View>
        {/* --- 4. Price Range --- */}
        <RangeInputGroup
          title="السعر"
          placeholderSuffix="د.ك"
          minValue={tabState.minPrice}
          maxValue={tabState.maxPrice}
          onMinChange={(value) => setField('minPrice', value)}
          onMaxChange={(value) => setField('maxPrice', value)}
        />
        {/* --- 5. Area Range --- */}
        <RangeInputGroup
          title="المساحة"
          placeholderSuffix="م²"
          minValue={tabState.minArea}
          maxValue={tabState.maxArea}
          onMinChange={(value) => setField('minArea', value)}
          onMaxChange={(value) => setField('maxArea', value)}
        />
        {/* --- 6. Features --- */}
        <PillGroup
          title="المزايا"
          options={FEATURE_OPTIONS}
          multiSelect={true}
          value={tabState.features}
          onChange={(value) => setField('features', value)}
        />
      </ScrollView>

      {/* --- Drawers (Rendered outside the scrollview but inside the tab) --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={MOCK_GOVERNORATES}
        onSelect={(value) => setField('gov', value)}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={MOCK_AREAS}
        onSelect={(value) => setField('area', value)}
      />
    </View>
  );
}
