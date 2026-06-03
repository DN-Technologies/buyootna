import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import RangeInputGroup from '@/core/components/filters/RangeInputGroup';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import StepperInput from '@/core/components/filters/StepperInput';
import { useFilterStore } from '@/core/store/useFilterStore';
import { AREAS,GOVERNORATES } from '@/core/utils/data/locations';

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

  // Dynamically resolve areas based on selected governorate, or show all if none selected
  const areasToDisplay = useMemo(() => {
    if (tabState.gov?.id) {
      return AREAS[tabState.gov.id] || [];
    }
    return Object.values(AREAS).flat();
  }, [tabState.gov]);

  return (
    <View className="flex-1">
      <BottomSheetScrollView
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
      </BottomSheetScrollView>

      {/* --- Drawers (Rendered outside the scrollview but inside the tab) --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        onSelect={(value: any) => {
          setField('gov', value);
          // If the current area doesn't belong to this governorate, clear it
          const currentArea = tabState.area;
          if (currentArea) {
            const validAreas = AREAS[value.id] || [];
            const isAreaValid = validAreas.some((a) => a.id === currentArea.id);
            if (!isAreaValid) {
              setField('area', null);
            }
          }
        }}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={areasToDisplay}
        onSelect={(value: any) => setField('area', value)}
      />
    </View>
  );
}
