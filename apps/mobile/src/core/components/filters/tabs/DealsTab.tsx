import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import DatePickerGroup from '@/core/components/filters/DatePickerGroup';
import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import RangeInputGroup from '@/core/components/filters/RangeInputGroup';
import SelectionDrawer, {
  SelectionItem,
} from '@/core/components/filters/SelectionDrawer';

const MOCK_GOVERNORATES = [
  { id: '1', label: 'العاصمة' },
  { id: '2', label: 'حولي' },
];
const MOCK_AREAS = [
  { id: '1', label: 'السالمية' },
  { id: '2', label: 'الجابرية' },
];
const PROPERTY_TYPES = [
  { id: 'industrial', label: 'صناعي' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'coastal', label: 'الشريط الساحلي' },
  { id: 'office', label: 'مكتب' },
  { id: 'private', label: 'خاص' },
];

export default function DealsTab() {
  const [selectedGov, setSelectedGov] = useState<SelectionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectionItem | null>(null);

  const [salePercentage, setSalePercentage] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');

  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
          paddingTop: 16,
        }}
      >
        {/* --- 1. Location Selection --- */}
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

        {/* --- 2. Sale Percentage --- */}
        <View className="mb-6 w-full">
          <Text
            className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            نسبة البيع
          </Text>
          <View className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4">
            <TextInput
              className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
              placeholder="اكتب نسبة البيع.."
              placeholderTextColor="#D1D5DB"
              value={salePercentage}
              onChangeText={setSalePercentage}
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* --- 3. Dates --- */}
        <DatePickerGroup
          startDate={startDate}
          endDate={endDate}
          onStartPress={() => console.log('Open Start Date Picker')}
          onEndPress={() => console.log('Open End Date Picker')}
        />

        {/* --- 4. Ranges --- */}
        <RangeInputGroup
          title="السعر"
          placeholderSuffix="د.ك"
          minValue={minPrice}
          maxValue={maxPrice}
          onMinChange={setMinPrice}
          onMaxChange={setMaxPrice}
        />
        <RangeInputGroup
          title="المساحة"
          placeholderSuffix="م²"
          minValue={minArea}
          maxValue={maxArea}
          onMinChange={setMinArea}
          onMaxChange={setMaxArea}
        />

        {/* --- 5. Property Type --- */}
        <PillGroup
          title="نوع العقار"
          options={PROPERTY_TYPES}
          multiSelect={true}
          value={propertyTypes}
          onChange={setPropertyTypes}
        />
      </ScrollView>

      {/* --- Modals --- */}
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
