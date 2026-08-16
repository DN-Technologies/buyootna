import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import SelectionDrawer, {
  SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';
import StepperInput from '@/shared/components/filters/StepperInput';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

export type OperationType = 'sale' | 'rent' | 'exchange';

const OPERATION_OPTIONS: { id: OperationType; label: string }[] = [
  { id: 'sale', label: 'بيع' },
  { id: 'rent', label: 'ايجار' },
  { id: 'exchange', label: 'بدل' },
];

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

const AMENITIES_OPTIONS: SelectionItem[] = [
  { id: 'pool', label: 'حمام سباحة' },
  { id: 'garage', label: 'كراج' },
  { id: 'elevator', label: 'مصعد' },
  { id: 'garden', label: 'حديقة' },
  { id: 'maid_room', label: 'غرفة خادمة' },
  { id: 'central_ac', label: 'تكييف مركزي' },
  { id: 'security', label: 'أمن وحراسة' },
  { id: 'furnished', label: 'مفروشة' },
];

export interface AlertPropertiesState {
  operationType: OperationType;
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  category: SelectionItem | null;
  price: string;
  rentValue: string;
  areaSize: string;
  rooms: number;
  baths: number;
  floors: number;
  requestYear: string;
  requiredYear: string;
  amenities: SelectionItem[];
}

export const DEFAULT_ALERT_PROPERTIES_STATE: AlertPropertiesState = {
  operationType: 'sale',
  governorate: null,
  area: null,
  category: null,
  price: '',
  rentValue: '',
  areaSize: '',
  rooms: 0,
  baths: 0,
  floors: 0,
  requestYear: '',
  requiredYear: '',
  amenities: [],
};

interface AlertPropertiesTabProps {
  value: AlertPropertiesState;
  onChange: <K extends keyof AlertPropertiesState>(
    field: K,
    value: AlertPropertiesState[K],
  ) => void;
}

export default function AlertPropertiesTab({
  value,
  onChange,
}: AlertPropertiesTabProps) {
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);
  const amenitiesDrawerRef = useRef<BottomSheetModal>(null);

  const filteredAreas = value.governorate
    ? AREAS[value.governorate.id] || []
    : [];

  const amenitiesLabel =
    value.amenities.length > 0
      ? value.amenities.map((item) => item.label).join('، ')
      : undefined;

  return (
    <View>
      {/* --- نوع العملية --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-3 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          نوع العملية
        </Text>
        <View className="flex-row items-center justify-between">
          {OPERATION_OPTIONS.map((option) => {
            const isSelected = value.operationType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => onChange('operationType', option.id)}
                className="flex-row items-center gap-2"
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? '#15304D' : '#D1D5DB'}
                />
                <Text
                  className="font-cairo-medium text-sm text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
            if (!value.governorate) {
              Alert.alert('تنبيه', 'يرجى اختيار المحافظة أولاً', [
                { text: 'حسناً' },
              ]);
              return;
            }
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

      {/* --- Conditional fields based on نوع العملية --- */}
      {value.operationType === 'sale' && (
        <View className="mb-6 w-full flex-row gap-3">
          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              السعر
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                placeholder="200,000 د.ك"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={value.price}
                onChangeText={(text) => onChange('price', text)}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>
          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              المساحة
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                placeholder="300 م2"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={value.areaSize}
                onChangeText={(text) => onChange('areaSize', text)}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>
        </View>
      )}

      {value.operationType === 'rent' && (
        <View className="mb-6 w-full flex-row gap-3">
          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              قيمة الايجار
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                placeholder="200,000 د.ك"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={value.rentValue}
                onChangeText={(text) => onChange('rentValue', text)}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>
          <View className="flex-1">
            <Text
              className="mb-1 font-cairo text-sm text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              المساحة
            </Text>
            <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
              <TextInput
                className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                placeholder="300 م2"
                placeholderTextColor="#D1D5DB"
                keyboardType="numeric"
                value={value.areaSize}
                onChangeText={(text) => onChange('areaSize', text)}
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          </View>
        </View>
      )}

      {value.operationType === 'exchange' && (
        <>
          <View className="mb-6 w-full flex-row gap-3">
            <StepperInput
              title="عدد الغرف"
              value={value.rooms}
              onChange={(val) => onChange('rooms', val)}
              min={0}
              max={20}
            />
            <StepperInput
              title="عدد الحمامات"
              value={value.baths}
              onChange={(val) => onChange('baths', val)}
              min={0}
              max={20}
            />
            <StepperInput
              title="عدد الادوار"
              value={value.floors}
              onChange={(val) => onChange('floors', val)}
              min={0}
              max={20}
            />
          </View>

          <View className="mb-6 mt-6 w-full flex-row gap-3">
            <View className="flex-1">
              <Text
                className="mb-1 font-cairo text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                سنة الطلب
              </Text>
              <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
                <TextInput
                  className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                  placeholder="2019"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  maxLength={4}
                  value={value.requestYear}
                  onChangeText={(text) => onChange('requestYear', text)}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text
                className="mb-1 font-cairo text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                السنة المطلوبة
              </Text>
              <View className="h-[40px] justify-center rounded-md border border-[#ECECEC] bg-white px-4">
                <TextInput
                  className="h-10 text-right font-cairo text-[13px] text-[#111111]"
                  placeholder="2025"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                  maxLength={4}
                  value={value.requiredYear}
                  onChangeText={(text) => onChange('requiredYear', text)}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>
            </View>
          </View>
        </>
      )}

      {/* --- المزايا --- */}
      <View className="mb-6 w-full">
        <DrawerTrigger
          label="المزايا"
          placeholder="اختر ما ترغب في البحث عنه"
          value={amenitiesLabel}
          onPress={() => amenitiesDrawerRef.current?.present()}
        />
      </View>

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
      <SelectionDrawer
        ref={amenitiesDrawerRef}
        title="اختر المزايا"
        data={AMENITIES_OPTIONS}
        multiSelect
        selectedItems={value.amenities}
        onSelectMultiple={(items) => onChange('amenities', items)}
      />
    </View>
  );
}
