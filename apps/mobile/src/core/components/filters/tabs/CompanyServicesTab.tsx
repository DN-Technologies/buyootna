import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text, TextInput, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import InlineDropdown from '@/core/components/filters/InlineDropdown';
import { useFilterStore } from '@/core/store/useFilterStore';

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

export interface CompanyServicesTabProps {
  onGovPress: () => void;
  onAreaPress: () => void;
}

export default function CompanyServicesTab({
  onGovPress,
  onAreaPress,
}: CompanyServicesTabProps) {
  // 1. Pull the state specifically for THIS tab ('companies')
  const tabState = useFilterStore((state) => state.companies);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('companies', field, value);
  };

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
            value={tabState.gov?.label}
            onPress={() => onGovPress()}
          />
          <DrawerTrigger
            label="المنطقة"
            placeholder={tabState.gov ? 'اختر المنطقة' : 'اختر المحافظة أولاً'}
            value={tabState.area?.label}
            onPress={() => {
              if (tabState.gov) {
                onAreaPress();
              }
            }}
          />
        </View>
      </BottomSheetScrollView>

      {/* --- Drawers rendered in GlobalFilterSheet parent --- */}
    </View>
  );
}
