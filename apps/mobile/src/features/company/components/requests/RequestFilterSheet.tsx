import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import SelectionDrawer, {
  type SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';
import { listedTypes, SPECIALTIES } from '@/shared/data/serviceCatalog';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

import type { RequestListFilters } from './types';

// What the sheet edits; turned into the API's filters on عرض النتائج
export interface RequestFilterDraft {
  specialty: SelectionItem | null;
  type: SelectionItem | null;
  priceFrom: string;
  priceTo: string;
  gov: SelectionItem | null;
  area: SelectionItem | null;
}

export const EMPTY_REQUEST_FILTERS: RequestFilterDraft = {
  specialty: null,
  type: null,
  priceFrom: '',
  priceTo: '',
  gov: null,
  area: null,
};

const SPECIALTY_ITEMS: SelectionItem[] = SPECIALTIES.map((label) => ({
  id: label,
  label,
}));

const toNumber = (text: string) => {
  const latin = text
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^0-9.]/g, '');
  const n = latin ? Number(latin) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

/** The sheet's picks as the list query's filters. */
export function toRequestListFilters(
  draft: RequestFilterDraft,
): RequestListFilters {
  const filters: RequestListFilters = {};
  if (draft.specialty) filters.specialty = draft.specialty.label;
  if (draft.type) filters.type = draft.type.label;
  const from = toNumber(draft.priceFrom);
  const to = toNumber(draft.priceTo);
  if (from !== undefined) filters.priceFrom = from;
  if (to !== undefined) filters.priceTo = to;
  // Requests keep «المحافظة - المنطقة»: the area narrows more
  const place = draft.area?.label ?? draft.gov?.label;
  if (place) filters.location = place;
  return filters;
}

/** How many fields narrow the list, for the filter button's dot. */
export const requestFilterCount = (draft: RequestFilterDraft) =>
  Object.keys(toRequestListFilters(draft)).length;

const sameDraft = (a: RequestFilterDraft, b: RequestFilterDraft) =>
  a.specialty?.id === b.specialty?.id &&
  a.type?.id === b.type?.id &&
  a.priceFrom === b.priceFrom &&
  a.priceTo === b.priceTo &&
  a.gov?.id === b.gov?.id &&
  a.area?.id === b.area?.id;

interface RequestFilterSheetProps {
  value: RequestFilterDraft;
  onApply: (draft: RequestFilterDraft) => void;
}

/**
 * تصفية البحث on the company's الطلبات (Figma 4410:165159): التخصص,
 * نوع الخدمة (of that specialty), نطاق السعر من / الى, and العنوان as
 * المحافظة + المنطقة. A draft until عرض النتائج, which stays off while
 * nothing changed; إعادة التعيين clears it.
 */
const RequestFilterSheet = forwardRef<BottomSheetModal, RequestFilterSheetProps>(
  ({ value, onApply }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['80%'], []);
    const [draft, setDraft] = useState<RequestFilterDraft>(value);

    const specialtyRef = useRef<BottomSheetModal>(null);
    const typeRef = useRef<BottomSheetModal>(null);
    const govRef = useRef<BottomSheetModal>(null);
    const areaRef = useRef<BottomSheetModal>(null);

    const typeItems = useMemo<SelectionItem[]>(
      () =>
        draft.specialty
          ? listedTypes(draft.specialty.id).map((type) => ({
              id: type,
              label: type,
            }))
          : [],
      [draft.specialty],
    );
    const areaItems = useMemo(
      () => (draft.gov ? (AREAS[draft.gov.id] ?? []) : []),
      [draft.gov],
    );

    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    const changed = !sameDraft(draft, value);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            className="w-full flex-row items-center bg-white px-4 pt-3.5"
            style={{ paddingBottom: insets.bottom + 16, gap: 16 }}
          >
            <TouchableOpacity
              testID="request-filter-apply"
              accessibilityRole="button"
              accessibilityState={{ disabled: !changed }}
              activeOpacity={0.7}
              disabled={!changed}
              onPress={() => {
                onApply(draft);
                dismiss();
              }}
              className={`h-12 flex-1 items-center justify-center rounded-full ${
                changed ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
              }`}
            >
              <Text className="font-cairo-bold text-sm leading-[22px] text-white">
                عرض النتائج
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="request-filter-reset"
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => setDraft(EMPTY_REQUEST_FILTERS)}
              className="items-center justify-center px-4 py-3"
            >
              <Text className="font-cairo-semibold text-sm leading-[22px] text-[#15304D]">
                إعادة التعيين
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      ),
      [changed, dismiss, draft, insets.bottom, onApply],
    );

    const priceBox = (
      key: 'priceFrom' | 'priceTo',
      placeholder: string,
    ) => (
      <BottomSheetTextInput
        testID={`request-filter-${key}`}
        value={draft[key]}
        onChangeText={(text) =>
          setDraft((current) => ({ ...current, [key]: text }))
        }
        placeholder={placeholder}
        placeholderTextColor="#979797"
        keyboardType="numeric"
        className="h-[46px] flex-1 rounded-[6px] border border-[#ECECEC] bg-white px-3 font-cairo-regular text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl', textAlign: 'right' }}
      />
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        topInset={insets.top}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        footerComponent={renderFooter}
        keyboardBlurBehavior="restore"
        // Opens on what's applied, not on picks left without عرض النتائج
        onChange={(index) => {
          if (index === 0) setDraft(value);
        }}
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
      >
        <View style={{ flex: 1 }} className="bg-white">
          <View className="flex-row items-center justify-between px-4 pb-4 pt-3">
            <Text className="font-cairo-semibold text-[18px] text-[#111111]">
              تصفية البحث
            </Text>
            <TouchableOpacity
              accessibilityLabel="إغلاق"
              onPress={dismiss}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 120,
              gap: 24,
            }}
          >
            <DrawerTrigger
              label="التخصص"
              placeholder="اختر التخصص أو المجال"
              value={draft.specialty?.label}
              onPress={() => specialtyRef.current?.present()}
            />
            <DrawerTrigger
              label="نوع الخدمة"
              placeholder={
                draft.specialty ? 'اختر نوع الخدمة' : 'اختر التخصص أولاً'
              }
              value={draft.type?.label}
              disabled={!draft.specialty}
              onPress={() => typeRef.current?.present()}
            />
            <View className="w-full gap-3">
              <Text
                className="font-cairo-medium text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                نطاق السعر
              </Text>
              <View className="w-full flex-row" style={{ gap: 8 }}>
                {priceBox('priceFrom', 'من')}
                {priceBox('priceTo', 'الى')}
              </View>
            </View>
            <View className="w-full flex-row" style={{ gap: 12 }}>
              <DrawerTrigger
                label="المحافظة"
                placeholder="اختر المحافظة"
                value={draft.gov?.label}
                onPress={() => govRef.current?.present()}
              />
              <DrawerTrigger
                label="المنطقة"
                placeholder={draft.gov ? 'اختر المنطقة' : 'المحافظة أولاً'}
                value={draft.area?.label}
                disabled={!draft.gov}
                onPress={() => areaRef.current?.present()}
              />
            </View>
          </BottomSheetScrollView>
        </View>

        <SelectionDrawer
          ref={specialtyRef}
          title="اختر التخصص"
          data={SPECIALTY_ITEMS}
          selectedItem={draft.specialty}
          onSelect={(specialty) =>
            // A new specialty has other service types
            setDraft((current) => ({
              ...current,
              specialty,
              type: current.specialty?.id === specialty.id ? current.type : null,
            }))
          }
        />
        <SelectionDrawer
          ref={typeRef}
          title="اختر نوع الخدمة"
          data={typeItems}
          selectedItem={draft.type}
          onSelect={(type) => setDraft((current) => ({ ...current, type }))}
        />
        <SelectionDrawer
          ref={govRef}
          title="اختر المحافظة"
          data={GOVERNORATES}
          selectedItem={draft.gov}
          onSelect={(gov) =>
            setDraft((current) => ({
              ...current,
              gov,
              area: current.gov?.id === gov.id ? current.area : null,
            }))
          }
        />
        <SelectionDrawer
          ref={areaRef}
          title="اختر المنطقة"
          data={areaItems}
          selectedItem={draft.area}
          onSelect={(area) => setDraft((current) => ({ ...current, area }))}
        />
      </BottomSheetModal>
    );
  },
);

RequestFilterSheet.displayName = 'RequestFilterSheet';

export default RequestFilterSheet;
