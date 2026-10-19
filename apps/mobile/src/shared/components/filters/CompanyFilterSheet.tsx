import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
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

export interface CompanyFilters {
  specialties: SelectionItem[];
  categories: SelectionItem[];
  govs: SelectionItem[];
  areas: SelectionItem[];
}

export const EMPTY_COMPANY_FILTERS: CompanyFilters = {
  specialties: [],
  categories: [],
  govs: [],
  areas: [],
};

const SPECIALTY_ITEMS: SelectionItem[] = SPECIALTIES.map((label) => ({
  id: label,
  label,
}));
// نوع الخدمة: the types of the picked specialties (the services catalogue)
const typeItemsFor = (specialties: SelectionItem[]): SelectionItem[] =>
  [...new Set(specialties.flatMap((item) => listedTypes(item.id)))].map(
    (type) => ({ id: type, label: type }),
  );

const joined = (items: SelectionItem[]) =>
  items.length ? items.map((item) => item.label).join('، ') : undefined;

const sameFilters = (a: CompanyFilters, b: CompanyFilters) =>
  (Object.keys(a) as (keyof CompanyFilters)[]).every(
    (key) =>
      a[key].map((item) => item.id).join('|') ===
      b[key].map((item) => item.id).join('|'),
  );

/** How many fields the filters narrow by, for the filter button's dot. */
export const companyFilterCount = (filters: CompanyFilters) =>
  (Object.keys(filters) as (keyof CompanyFilters)[]).filter(
    (key) => filters[key].length > 0,
  ).length;

interface CompanyFilterSheetProps {
  value: CompanyFilters;
  onApply: (filters: CompanyFilters) => void;
}

/**
 * تصفية البحث on the شركات tab (Figma "services filters"): التخصص,
 * نوع الخدمة, المحافظة and المنطقة, each picked from a list the way the
 * governorate and area are. The picks are a draft until عرض النتائج,
 * which stays off while nothing changed; إعادة التعيين clears them.
 */
const CompanyFilterSheet = forwardRef<BottomSheetModal, CompanyFilterSheetProps>(
  ({ value, onApply }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['70%'], []);
    const [draft, setDraft] = useState<CompanyFilters>(value);

    const specialtyRef = useRef<BottomSheetModal>(null);
    const categoryRef = useRef<BottomSheetModal>(null);
    const govRef = useRef<BottomSheetModal>(null);
    const areaRef = useRef<BottomSheetModal>(null);

    const set = <K extends keyof CompanyFilters>(key: K, items: CompanyFilters[K]) =>
      setDraft((current) => ({ ...current, [key]: items }));

    // Service types of the picked specialties; none until one is picked
    const typeItems = useMemo(
      () => typeItemsFor(draft.specialties),
      [draft.specialties],
    );

    // Areas of the picked governorates, or all of them
    const areaItems = useMemo(
      () =>
        draft.govs.length
          ? draft.govs.flatMap((gov) => AREAS[gov.id] ?? [])
          : Object.values(AREAS).flat(),
      [draft.govs],
    );

    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    const changed = !sameFilters(draft, value);

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
            className="w-full flex-row items-center bg-white px-5 pt-3.5"
            style={{ paddingBottom: insets.bottom + 16, gap: 16 }}
          >
            <TouchableOpacity
              testID="company-filter-apply"
              accessibilityRole="button"
              accessibilityState={{ disabled: !changed }}
              activeOpacity={0.7}
              disabled={!changed}
              onPress={() => {
                onApply(draft);
                dismiss();
              }}
              className={`h-12 flex-1 items-center justify-center rounded-full ${
                changed ? 'bg-[#15304D]' : 'bg-[#A3A3A3]'
              }`}
            >
              <Text className="font-cairo-bold text-sm leading-[22px] text-white">
                عرض النتائج
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="company-filter-reset"
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() => setDraft(EMPTY_COMPANY_FILTERS)}
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
        // Opens on what's applied, not on picks left without عرض النتائج
        onChange={(index) => {
          if (index === 0) setDraft(value);
        }}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 72, height: 6 }}
      >
        <View style={{ flex: 1 }} className="bg-white">
          <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
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
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 120,
              gap: 20,
            }}
          >
            <DrawerTrigger
              label="التخصص"
              placeholder="اختر التخصص أو المجال"
              value={joined(draft.specialties)}
              onPress={() => specialtyRef.current?.present()}
            />
            <DrawerTrigger
              label="نوع الخدمة"
              placeholder={
                draft.specialties.length
                  ? 'اختر نوع الخدمة التي تبحث عنها'
                  : 'اختر التخصص أولاً'
              }
              value={joined(draft.categories)}
              disabled={!draft.specialties.length}
              onPress={() => categoryRef.current?.present()}
            />
            <View className="w-full flex-row" style={{ gap: 12 }}>
              <DrawerTrigger
                label="المحافظة"
                placeholder="اختر المحافظة"
                value={joined(draft.govs)}
                onPress={() => govRef.current?.present()}
              />
              <DrawerTrigger
                label="المنطقة"
                placeholder="اختر المنطقة"
                value={joined(draft.areas)}
                onPress={() => areaRef.current?.present()}
              />
            </View>
          </BottomSheetScrollView>
        </View>

        <SelectionDrawer
          ref={specialtyRef}
          title="اختر التخصص"
          data={SPECIALTY_ITEMS}
          multiSelect
          selectedItems={draft.specialties}
          onSelectMultiple={(items) => {
            // Keep only the service types still under the picked specialties
            const allowed = new Set(typeItemsFor(items).map((t) => t.id));
            setDraft((current) => ({
              ...current,
              specialties: items,
              categories: current.categories.filter((t) => allowed.has(t.id)),
            }));
          }}
        />
        <SelectionDrawer
          ref={categoryRef}
          title="اختر نوع الخدمة"
          data={typeItems}
          multiSelect
          selectedItems={draft.categories}
          onSelectMultiple={(items) => set('categories', items)}
        />
        <SelectionDrawer
          ref={govRef}
          title="اختر المحافظة"
          data={GOVERNORATES}
          multiSelect
          selectedItems={draft.govs}
          onSelectMultiple={(govs) => {
            // Keep only the areas still inside the picked governorates
            const allowed = new Set(
              govs.flatMap((gov) => (AREAS[gov.id] ?? []).map((a) => a.id)),
            );
            setDraft((current) => ({
              ...current,
              govs,
              areas: govs.length
                ? current.areas.filter((area) => allowed.has(area.id))
                : current.areas,
            }));
          }}
        />
        <SelectionDrawer
          ref={areaRef}
          title="اختر المنطقة"
          data={areaItems}
          multiSelect
          selectedItems={draft.areas}
          onSelectMultiple={(items) => set('areas', items)}
        />
      </BottomSheetModal>
    );
  },
);

CompanyFilterSheet.displayName = 'CompanyFilterSheet';

export default CompanyFilterSheet;
