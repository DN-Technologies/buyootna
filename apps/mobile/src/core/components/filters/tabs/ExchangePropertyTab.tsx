import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import { useFilterStore } from '@/core/store/useFilterStore';
import { AREAS, GOVERNORATES } from '@/core/utils/data/locations';

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

export default function ExchangePropertyTab() {
  // 1. Pull the state specifically for THIS tab ('exchange')
  const tabState = useFilterStore((state) => state.exchange);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // --- Modal Drawer Refs ---
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('exchange', field, value);
  };

  // Dynamically resolve areas based on selected governorates, or show all if none selected
  const areasToDisplay = useMemo(() => {
    let baseAreas = [];
    if (tabState.govs && tabState.govs.length > 0) {
      baseAreas = tabState.govs.flatMap((gov) => AREAS[gov.id] || []);
    } else {
      baseAreas = Object.values(AREAS).flat();
    }
    // Prepend the "All" (الكل) option
    return [{ id: 'all', label: 'الكل' }, ...baseAreas];
  }, [tabState.govs]);

  // Format comma-separated labels for trigger buttons
  const formattedGovValue = useMemo(() => {
    if (!tabState.govs || tabState.govs.length === 0) return undefined;
    return tabState.govs.map((g) => g.label).join('، ');
  }, [tabState.govs]);

  const formattedAreaValue = useMemo(() => {
    if (!tabState.areas || tabState.areas.length === 0) return undefined;
    return tabState.areas.map((a) => a.label).join('، ');
  }, [tabState.areas]);

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
        {/* --- 1. Location Selection (Governorate & Area) --- */}
        <View className="mb-2 w-full flex-row gap-3">
          <DrawerTrigger
            label="المحافظة"
            placeholder="اختر المحافظة"
            value={formattedGovValue}
            onPress={() => govDrawerRef.current?.present()}
          />
          <DrawerTrigger
            label="المنطقة"
            placeholder="اختر المنطقة"
            value={formattedAreaValue}
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
              <BottomSheetTextInput
                className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
                placeholder="2026"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                maxLength={4}
                value={tabState.requiredYear}
                onChangeText={(value) => setField('requiredYear', value)}
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
              <BottomSheetTextInput
                className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
                placeholder="2019"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                maxLength={4}
                value={tabState.requestYear}
                onChangeText={(value) => setField('requestYear', value)}
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
          value={tabState.status}
          onChange={(value) => setField('status', value)}
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
            <BottomSheetTextInput
              className="mr-2 h-10 flex-1 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
              placeholder="300"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={tabState.areaSize}
              onChangeText={(value) => setField('areaSize', value)}
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
          value={tabState.features}
          onChange={(value) => setField('features', value)}
        />
      </BottomSheetScrollView>

      {/* --- Drawers (Rendered outside the scrollview but inside the tab) --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        multiSelect={true}
        selectedItems={tabState.govs}
        onSelectMultiple={(selectedGovs) => {
          setField('govs', selectedGovs);
          if (selectedGovs.length > 0) {
            const allowedAreaIds = new Set(
              selectedGovs.flatMap((gov) => (AREAS[gov.id] || []).map((a) => a.id))
            );
            const updatedAreas = tabState.areas.filter(
              (area) => area.id === 'all' || allowedAreaIds.has(area.id)
            );
            setField('areas', updatedAreas);
          }
        }}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={areasToDisplay}
        multiSelect={true}
        selectedItems={tabState.areas}
        onSelectMultiple={(selectedAreas) => setField('areas', selectedAreas)}
      />
    </View>
  );
}
