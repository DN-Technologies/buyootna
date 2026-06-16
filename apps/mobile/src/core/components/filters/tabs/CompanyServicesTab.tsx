import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { Text, TextInput, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import InlineDropdown from '@/core/components/filters/InlineDropdown';
import SelectionDrawer from '@/core/components/filters/SelectionDrawer';
import { useFilterStore } from '@/core/store/useFilterStore';
import { AREAS, GOVERNORATES } from '@/core/utils/data/locations';

// --- Configuration Constants ---
const SPECIALTY_OPTIONS = [
  { id: 'finishing', label: 'تشطيب' },
  { id: 'plumbing', label: 'ادوات صحية' },
  { id: 'networks', label: 'شبكات نت' },
  { id: 'interior_design', label: 'تصميم داخلي' },
  { id: 'furniture', label: 'الاثاث' },
  { id: 'engineering_office', label: 'مكاتب هندسية' },
  { id: 'contractors', label: 'مقاولين & شركات مباني' },
  { id: 'decorations', label: 'ديكورات' },
  { id: 'tiles', label: 'شركات البلاط' },
  { id: 'heaters', label: 'سخانات' },
];

export default function CompanyServicesTab() {
  // 1. Pull the state specifically for THIS tab ('companies')
  const tabState = useFilterStore((state) => state.companies);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // --- Modal Drawer Refs ---
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('companies', field, value);
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
        {/* --- 1. Specialty Dropdown --- */}
        <InlineDropdown
          title="مجال التخصص"
          placeholder="مكتب هندسي، شركة مقاولات.."
          options={SPECIALTY_OPTIONS}
          value={tabState.specialty}
          onChange={(value) => setField('specialty', value)}
        />

        {/* --- 2. Request Type Text Input --- */}
        <View className="mb-6 w-full">
          <Text
            className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            نوع الطلب
          </Text>
          <View className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4">
            <TextInput
              className="h-10 text-right font-cairo text-[13px] leading-[22px] text-[#111111]"
              placeholder="اكتب الخدمة التي تريدها.."
              placeholderTextColor="#D1D5DB"
              value={tabState.requestType}
              onChangeText={(value) => setField('requestType', value)}
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* --- 3. Location Selection (Governorate & Area) --- */}
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
      </BottomSheetScrollView>

      {/* --- Modal Layout Drawers --- */}
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
