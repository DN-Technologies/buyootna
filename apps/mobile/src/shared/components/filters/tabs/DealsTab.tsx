import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

import DatePickerGroup from '@/shared/components/filters/DatePickerGroup';
import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import PillGroup from '@/shared/components/filters/PillGroup';
import RangeInputGroup from '@/shared/components/filters/RangeInputGroup';
import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import { useFilterStore } from '@/shared/store/useFilterStore';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

const PROPERTY_TYPES = [
  { id: 'industrial', label: 'صناعي' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'coastal', label: 'الشريط الساحلي' },
  { id: 'office', label: 'مكتب' },
  { id: 'private', label: 'خاص' },
];

export default function DealsTab() {
  // 1. Pull the state specifically for THIS tab ('deals')
  const tabState = useFilterStore((state) => state.deals);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // --- Modal Drawer Refs ---
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('deals', field, value);
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
        {/* --- 1. Location Selection --- */}
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

        {/* --- 2. Sale Percentage --- */}
        <View className="mb-6 w-full">
          <Text
            className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            نسبة البيع
          </Text>
          <View className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4">
            <BottomSheetTextInput
              className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
              placeholder="اكتب نسبة البيع.."
              placeholderTextColor="#D1D5DB"
              value={tabState.salePercentage}
              onChangeText={(value) => setField('salePercentage', value)}
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* --- 3. Dates --- */}
        <DatePickerGroup
          startDate={tabState.startDate}
          endDate={tabState.endDate}
          onStartPress={() => console.log('Open Start Date Picker')}
          onEndPress={() => console.log('Open End Date Picker')}
        />

        {/* --- 4. Ranges --- */}
        <RangeInputGroup
          title="السعر"
          placeholderSuffix="د.ك"
          minValue={tabState.minPrice}
          maxValue={tabState.maxPrice}
          onMinChange={(value) => setField('minPrice', value)}
          onMaxChange={(value) => setField('maxPrice', value)}
        />
        <RangeInputGroup
          title="المساحة"
          placeholderSuffix="م²"
          minValue={tabState.minArea}
          maxValue={tabState.maxArea}
          onMinChange={(value) => setField('minArea', value)}
          onMaxChange={(value) => setField('maxArea', value)}
        />

        {/* --- 5. Property Type --- */}
        <PillGroup
          title="نوع العقار"
          options={PROPERTY_TYPES}
          multiSelect={true}
          value={tabState.propertyTypes}
          onChange={(value) => setField('propertyTypes', value)}
        />
      </BottomSheetScrollView>

      {/* --- Modals --- */}
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
