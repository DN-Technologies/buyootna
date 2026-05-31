import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import DatePickerGroup from '@/core/components/filters/DatePickerGroup';
import PillGroup from '@/core/components/filters/PillGroup';

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
  const [status, setStatus] = useState<string>('starts_soon');
  const [propertyType, setPropertyType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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
        {/* --- 1. Auction Status --- */}
        <PillGroup
          title="حالة المزاد"
          options={AUCTION_STATUS_OPTIONS}
          multiSelect={false}
          value={status}
          onChange={setStatus}
        />

        {/* --- 2. Date Range --- */}
        <DatePickerGroup
          startDate={startDate}
          endDate={endDate}
          onStartPress={() => console.log('Open Start Date Picker')}
          onEndPress={() => console.log('Open End Date Picker')}
        />

        {/* --- 3. Property Type --- */}
        <PillGroup
          title="نوع العقار"
          options={PROPERTY_TYPES}
          multiSelect={true}
          value={propertyType}
          onChange={setPropertyType}
        />
      </ScrollView>
    </View>
  );
}
