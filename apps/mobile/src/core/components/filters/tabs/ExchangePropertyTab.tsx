import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import DrawerTrigger from '../DrawerTrigger';
import PillGroup from '../PillGroup';
import SelectionDrawer, { SelectionItem } from '../SelectionDrawer';

// --- Configuration Constants ---
const STATUS_OPTIONS = [
  { id: 'land', label: 'أرض' },
  { id: 'building', label: 'مبنى' },
];

const EXCHANGE_FEATURE_OPTIONS = [
  { id: 'three_streets', label: 'ثلاث شوارع' },
  { id: 'front_back', label: 'بطن وظهر' },
  { id: 'corner', label: 'زاوية' },
  { id: 'one_street', label: 'شارع واحد' },
  { id: 'two_streets_corner_detached', label: 'شارعين زاوية - غير متصلين' },
  { id: 'three_streets_detached', label: 'ثلاث شوارع - غير متصلة' },
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

export default function ExchangePropertyTab() {
  // --- Form States ---
  const [selectedGov, setSelectedGov] = useState<SelectionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectionItem | null>(null);

  const [requestYear, setRequestYear] = useState<string>('');
  const [requiredYear, setRequiredYear] = useState<string>('');

  const [status, setStatus] = useState<string>('building');
  const [areaSize, setAreaSize] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // --- Modal Drawer Refs ---
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
        {/* --- 1. Location Selection (Governorate & Area) --- */}
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

        {/* --- 2. Timeline Requirements (Request Year & Required Year) --- */}
        <View className="mb-6 w-full flex-row gap-3">
          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              السنة المطلوبة
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
                placeholder="2026"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                maxLength={4}
                value={requiredYear}
                onChangeText={setRequiredYear}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>

          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              سنة الطلب
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
                placeholder="2019"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                maxLength={4}
                value={requestYear}
                onChangeText={setRequestYear}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>
        </View>

        {/* --- 3. Property Status (Single Selection) --- */}
        <PillGroup
          title="الحالة"
          options={STATUS_OPTIONS}
          multiSelect={false}
          value={status}
          onChange={setStatus}
        />

        {/* --- 4. Total Area Input --- */}
        <View className="mb-6 w-full">
          <Text
            className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            المساحة
          </Text>
          <View className="h-[40px] flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4">
            <TextInput
              className="mr-2 h-10 flex-1 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
              placeholder="300"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={areaSize}
              onChangeText={setAreaSize}
              style={{ writingDirection: 'rtl' }}
            />
            <Text className="font-cairo text-xs leading-[22px] text-[#989898]">
              م²
            </Text>
          </View>
        </View>

        {/* --- 5. Custom Structural Features (Multi-Selection) --- */}
        <PillGroup
          title="المزايا"
          options={EXCHANGE_FEATURE_OPTIONS}
          multiSelect={true}
          value={selectedFeatures}
          onChange={setSelectedFeatures}
        />
      </ScrollView>

      {/* --- Modal Layout Drawers --- */}
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
