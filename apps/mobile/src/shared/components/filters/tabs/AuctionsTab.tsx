import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';

import DatePickerGroup from '@/shared/components/filters/DatePickerGroup';
import PillGroup from '@/shared/components/filters/PillGroup';
import { useFilterStore } from '@/shared/store/useFilterStore';

const AUCTION_STATUS_OPTIONS = [
  { id: 'starts_soon', label: 'يبدأ قريباً' },
  { id: 'ended', label: 'منتهي' },
];

const PROPERTY_TYPES = [
  { id: 'industrial', label: 'صناعي' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'coastal', label: 'الشريط الساحلي' },
  { id: 'office', label: 'مكتب' },
  { id: 'private', label: 'خاص' },
];

export default function AuctionsTab() {
  // 1. Pull the state specifically for THIS tab ('auctions')
  const tabState = useFilterStore((state) => state.auctions);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('auctions', field, value);
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
        {/* --- 1. Auction Status --- */}
        <PillGroup
          title="حالة المزاد"
          options={AUCTION_STATUS_OPTIONS}
          multiSelect={false}
          value={tabState.status}
          onChange={(value) => setField('status', value)}
        />

        {/* --- 2. Date Range --- */}
        <DatePickerGroup
          startDate={tabState.startDate}
          endDate={tabState.endDate}
          onStartPress={() => console.log('Open Start Date Picker')}
          onEndPress={() => console.log('Open End Date Picker')}
        />

        {/* --- 3. Property Type --- */}
        <PillGroup
          title="نوع العقار"
          options={PROPERTY_TYPES}
          multiSelect={true}
          value={tabState.propertyTypes}
          onChange={(value) => setField('propertyTypes', value)}
        />
      </BottomSheetScrollView>
    </View>
  );
}
