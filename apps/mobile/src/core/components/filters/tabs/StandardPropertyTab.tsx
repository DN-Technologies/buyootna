import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import RangeInputGroup from '@/core/components/filters/RangeInputGroup';
import SelectionDrawer, {
  SelectionItem,
} from '@/core/components/filters/SelectionDrawer';
import StepperInput from '@/core/components/filters/StepperInput';

export interface StandardPropertyTabProps {
  type: 'sell' | 'rent';
}

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

export default function StandardPropertyTab({
  type,
}: StandardPropertyTabProps) {
  // --- Form State ---\
  const [selectedGov, setSelectedGov] = useState<SelectionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectionItem | null>(null);

  const [category, setCategory] = useState<string>('apartment');

  const [rooms, setRooms] = useState<number>(1);
  const [baths, setBaths] = useState<number>(1);

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');

  const [features, setFeatures] = useState<string[]>([]);

  // --- Drawer Refs ---
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

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
            value={selectedGov?.label}
            onPress={() => govDrawerRef.current?.present()}
          />
          <DrawerTrigger
            label="المنطقة"
            placeholder="اختر المنطقة"
            value={selectedArea?.label}
            onPress={() => areaDrawerRef.current?.present()}
          />
        </View>
        {/* --- 2. Property Category --- */}
        <PillGroup
          title="فئة العقار"
          options={CATEGORY_OPTIONS}
          multiSelect={false}
          value={category}
          onChange={setCategory}
        />
        {/* --- 3. Steppers Row (Rooms & Baths) --- */}
        <View className="mb-6 w-full flex-row gap-3">
          <StepperInput
            title="عدد الغرف"
            value={rooms}
            onChange={setRooms}
            min={1}
            max={10}
          />
          <StepperInput
            title="عدد الحمامات"
            value={baths}
            onChange={setBaths}
            min={1}
            max={10}
          />
        </View>
        {/* --- 4. Price Range --- */}
        <RangeInputGroup
          title="السعر"
          placeholderSuffix="د.ك"
          minValue={minPrice}
          maxValue={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
        />
        {/* --- 5. Area Range --- */}
        <RangeInputGroup
          title="المساحة"
          placeholderSuffix="م²"
          minValue={minArea}
          maxValue={maxArea}
          onMinChange={setMinArea}
          onMaxChange={setMaxArea}
        />
        {/* --- 6. Features --- */}
        <PillGroup
          title="المزايا"
          options={FEATURE_OPTIONS}
          multiSelect={true}
          value={features}
          onChange={setFeatures}
        />
      </ScrollView>

      {/* --- Drawers (Rendered outside the scrollview but inside the tab) --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={MOCK_GOVERNORATES}
        onSelect={setSelectedGov}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={MOCK_AREAS}
        onSelect={setSelectedArea}
      />
    </View>
  );
}
