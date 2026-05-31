import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text, TextInput, View } from 'react-native';

import DrawerTrigger from '@/core/components/filters/DrawerTrigger';
import PillGroup from '@/core/components/filters/PillGroup';
import { useFilterStore } from '@/core/store/useFilterStore';

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

export interface ExchangePropertyTabProps {
  onGovPress: () => void;
  onAreaPress: () => void;
}

export default function ExchangePropertyTab({
  onGovPress,
  onAreaPress,
}: ExchangePropertyTabProps) {
  // 1. Pull the state specifically for THIS tab ('exchange')
  const tabState = useFilterStore((state) => state.exchange);

  // 2. Pull the update function
  const updateField = useFilterStore((state) => state.updateField);

  // Helper function to keep JSX clean
  const setField = (field: keyof typeof tabState, value: any) => {
    updateField('exchange', field, value);
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
        {/* --- 1. Location Selection (Governorate & Area) --- */}
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
              <TextInput
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
            <TextInput
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

      {/* --- Drawers rendered in GlobalFilterSheet parent --- */}
    </View>
  );
}
