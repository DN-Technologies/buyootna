import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text, TextInput, View } from 'react-native';

import DatePickerGroup from '@/core/components/filters/DatePickerGroup';
import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import RangeInputGroup from '@/core/components/filters/RangeInputGroup';
import { useFilterStore } from '@/core/store/useFilterStore';

const PROPERTY_TYPES = [
  { id: 'industrial', label: 'صناعي' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'coastal', label: 'الشريط الساحلي' },
  { id: 'office', label: 'مكتب' },
  { id: 'private', label: 'خاص' },
];

export interface DealsTabProps {
  onGovPress: () => void;
  onAreaPress: () => void;
}

export default function DealsTab({ onGovPress, onAreaPress }: DealsTabProps) {
  // 1. Pull the state specifically for THIS tab ('deals')
  const tabState = useFilterStore((state) => state.deals);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('deals', field, value);
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
        {/* --- 1. Location Selection --- */}
        <View className="mb-2 w-full flex-row gap-3">
          <DrawerTrigger
            label="المحافظة"
            placeholder="اختر المحافظة"
            value={tabState.gov?.label}
            onPress={onGovPress}
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

      {/* --- Drawers rendered in GlobalFilterSheet parent --- */}
    </View>
  );
}
