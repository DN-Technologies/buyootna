import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import InlineDropdown from '@/core/components/filters/InlineDropdown';
import SelectionDrawer, {
  SelectionItem,
} from '@/core/components/filters/SelectionDrawer';

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

export default function CompanyServicesTab() {
  // --- Form States ---
  const [specialty, setSpecialty] = useState<string>('');
  const [requestType, setRequestType] = useState<string>('');
  const [selectedGov, setSelectedGov] = useState<SelectionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectionItem | null>(null);

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
        {/* --- 1. Specialty Dropdown --- */}
        <InlineDropdown
          title="مجال التخصص"
          placeholder="مكتب هندسي، شركة مقاولات.."
          options={SPECIALTY_OPTIONS}
          value={specialty}
          onChange={setSpecialty}
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
              value={requestType}
              onChangeText={setRequestType}
              style={{ writingDirection: 'rtl' }}
            />
          </View>
        </View>

        {/* --- 3. Location Selection (Governorate & Area) --- */}
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
