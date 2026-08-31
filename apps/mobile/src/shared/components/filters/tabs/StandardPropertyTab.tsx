import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import PillGroup from '@/shared/components/filters/PillGroup';
import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import { useFilterStore } from '@/shared/store/useFilterStore';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

// --- Category options matching Figma design ---
const CATEGORY_OPTIONS = [
  { id: 'investment', label: 'استثماري' },
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'بيت' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'building', label: 'عمارة' },
  { id: 'office', label: 'مكتب' },
  { id: 'chalet', label: 'شاليه' },
  { id: 'residential', label: 'سكني' },
];

export interface StandardPropertyTabProps {
  type: 'sell' | 'rent' | 'offices';
}

export default function StandardPropertyTab({
  type,
}: StandardPropertyTabProps) {
  // 1. Pull the state specifically for THIS tab ('sell', 'rent', or 'offices')
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
        {/* --- 1. Location Row (Governorate & Area) --- */}
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

        {type !== 'offices' && (
          <>
            {/* --- 2. Property Category --- */}
            <PillGroup
              title="فئة العقار"
              options={CATEGORY_OPTIONS}
              multiSelect={true}
              value={
                Array.isArray(tabState.category)
                  ? tabState.category
                  : tabState.category
                    ? [tabState.category]
                    : []
              }
              onChange={(value) => setField('category', value)}
            />

            {/* --- 3. Price Input --- */}
            <View className="mb-6 w-full">
              <Text
                className="mb-1 font-cairo text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                السعر
              </Text>
              <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
                <BottomSheetTextInput
                  className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                  placeholder="200,000 د.ك"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  value={tabState.maxPrice}
                  onChangeText={(value) => setField('maxPrice', value)}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>
            </View>
          </>
        )}
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
          // Filter out selected areas that don't belong to any of the new selected governorates
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
