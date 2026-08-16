import { BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import DatePickerGroup from '@/shared/components/filters/DatePickerGroup';
import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import SelectionDrawer, {
  SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

const CATEGORY_OPTIONS: SelectionItem[] = [
  { id: 'residential', label: 'سكني' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'بيت' },
  { id: 'villa', label: 'فيلا' },
  { id: 'land', label: 'أرض' },
  { id: 'building', label: 'عمارة' },
  { id: 'chalet', label: 'شاليه' },
];

const formatDate = (date: Date) =>
  `${date.getDate()}/${date.getMonth() + 1}`;

export interface AlertAuctionsState {
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  category: SelectionItem | null;
  startDate: Date | null;
  endDate: Date | null;
}

export const DEFAULT_ALERT_AUCTIONS_STATE: AlertAuctionsState = {
  governorate: null,
  area: null,
  category: null,
  startDate: null,
  endDate: null,
};

interface AlertAuctionsTabProps {
  value: AlertAuctionsState;
  onChange: <K extends keyof AlertAuctionsState>(
    field: K,
    value: AlertAuctionsState[K],
  ) => void;
}

export default function AlertAuctionsTab({
  value,
  onChange,
}: AlertAuctionsTabProps) {
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(
    null,
  );

  const filteredAreas = value.governorate
    ? AREAS[value.governorate.id] || []
    : [];

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android closes the picker itself after a pick/dismiss; iOS keeps it
    // open in-place (spinner), so only close manually on Android.
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
    if (event.type === 'dismissed' || !date) {
      return;
    }
    if (activePicker === 'start') {
      onChange('startDate', date);
    } else if (activePicker === 'end') {
      onChange('endDate', date);
    }
    if (Platform.OS === 'ios') {
      setActivePicker(null);
    }
  };

  return (
    <View>
      {/* --- المحافظة / المنطقة --- */}
      <View className="mb-2 w-full flex-row gap-3">
        <DrawerTrigger
          label="المحافظة"
          placeholder="اختر المحافظة"
          value={value.governorate?.label}
          onPress={() => govDrawerRef.current?.present()}
        />
        <DrawerTrigger
          label="المنطقة"
          placeholder="اختر المنطقة"
          value={value.area?.label}
          onPress={() => {
            if (!value.governorate) return;
            areaDrawerRef.current?.present();
          }}
        />
      </View>

      {/* --- فئة العقار --- */}
      <InlineDropdown
        title="فئة العقار"
        placeholder="اختر نوع عقارك"
        options={CATEGORY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
        value={value.category?.id || ''}
        onChange={(id) =>
          onChange(
            'category',
            CATEGORY_OPTIONS.find((c) => c.id === id) || null,
          )
        }
      />

      {/* --- التاريخ من / التاريخ الى --- */}
      <DatePickerGroup
        startDate={value.startDate ? formatDate(value.startDate) : ''}
        endDate={value.endDate ? formatDate(value.endDate) : ''}
        onStartPress={() => setActivePicker('start')}
        onEndPress={() => setActivePicker('end')}
      />

      {activePicker && (
        <DateTimePicker
          value={
            (activePicker === 'start' ? value.startDate : value.endDate) ||
            new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* --- Drawers --- */}
      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        onSelect={(item) => {
          onChange('governorate', item);
          onChange('area', null);
        }}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={filteredAreas}
        onSelect={(item) => onChange('area', item)}
      />
    </View>
  );
}
