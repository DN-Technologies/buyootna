import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

import {
  EMPTY_HOME_FILTERS,
  EXCHANGE_CATEGORIES,
  hasHomeFilters,
  HOME_FILTER_TABS,
  type HomeFilters,
  type HomeFiltersByTab,
  type HomeFilterTab,
  SALE_RENT_CATEGORIES,
} from './homeFilter';

interface HomeFilterSheetProps {
  // The tab it opens on: the list showing on the home
  initialTab: HomeFilterTab;
  // What each list is filtered by now
  applied: HomeFiltersByTab;
  // عرض النتائج: filter that tab's list (and show it)
  onApply: (tab: HomeFilterTab, filters: HomeFilters) => void;
  // إعادة التعيين: that tab's list unfiltered again
  onReset: (tab: HomeFilterTab) => void;
}

const LABEL = 'font-cairo-medium text-[14px] leading-[21px] text-[#111111]';
const BOX =
  'h-[40px] justify-center rounded-[6px] border border-[#ECECEC] bg-white';
const INPUT_TEXT = {
  fontFamily: 'Cairo_400Regular',
  fontSize: 14,
  color: '#111111',
  textAlign: 'right' as const,
  letterSpacing: -0.408,
  paddingVertical: 0,
};

const withCommas = (value: string) =>
  value.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      activeOpacity={0.7}
      onPress={onPress}
      className="h-[32px] items-center justify-center rounded-[16px] bg-[#F5F7F9] px-[12px]"
      style={{
        borderWidth: 1.2,
        borderColor: selected ? '#C5A36D' : 'transparent',
      }}
    >
      <Text className="font-cairo text-[14px] leading-[21px] tracking-[-0.408px] text-[#111111]">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PickerField({
  label,
  value,
  placeholder,
  onPress,
  testID,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <View className="flex-1" style={{ gap: 10 }}>
      <Text className={LABEL}>{label}</Text>
      <TouchableOpacity
        testID={testID}
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={onPress}
        className={`${BOX} px-[12px]`}
      >
        <Text
          numberOfLines={1}
          className={`font-cairo text-[14px] leading-[21px] tracking-[-0.408px] ${
            value ? 'text-[#111111]' : 'text-[#979797]'
          }`}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
  maxLength,
  testID,
  format,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  maxLength?: number;
  testID: string;
  format?: (value: string) => string;
}) {
  return (
    <View className="flex-1" style={{ gap: 10 }}>
      <Text className={LABEL}>{label}</Text>
      <View className={`${BOX} px-[16px]`}>
        <BottomSheetTextInput
          testID={testID}
          value={format ? format(value) : value}
          onChangeText={(text) => onChange(text.replace(/[^\d]/g, ''))}
          placeholder={placeholder}
          placeholderTextColor="#979797"
          keyboardType="number-pad"
          maxLength={maxLength}
          style={INPUT_TEXT}
        />
      </View>
    </View>
  );
}

/**
 * تصفية البحث on the home (Figma 5550:138840 بيع, 5550:138765 ايجار,
 * 5550:138675 بدل): المحافظة and المنطقة, then فئة العقار and السعر, or on
 * بدل سنة الطلب, السنة المطلوبة, الحالة and السعر. مكاتب has the location
 * only (the offices list filters by place). Each tab keeps its own filters.
 */
const HomeFilterSheet = forwardRef<BottomSheetModal, HomeFilterSheetProps>(
  ({ initialTab, applied, onApply, onReset }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['88%'], []);
    const [tab, setTab] = useState<HomeFilterTab>(initialTab);
    const [draft, setDraft] = useState<HomeFiltersByTab>(applied);
    const governorateRef = useRef<any>(null);
    const areaRef = useRef<any>(null);

    const filters = draft[tab];
    const update = (patch: Partial<HomeFilters>) =>
      setDraft((prev) => ({ ...prev, [tab]: { ...prev[tab], ...patch } }));
    const canApply = hasHomeFilters(tab, filters);

    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    const governorate = GOVERNORATES.find((g) => g.id === filters.governorateId);
    const areas = AREAS[filters.governorateId] ?? [];
    const area = areas.find((a) => a.id === filters.areaId);

    const toggleCategory = (id: string) =>
      update({
        categories: filters.categories.includes(id)
          ? filters.categories.filter((c) => c !== id)
          : [...filters.categories, id],
      });

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

    const apply = useCallback(() => {
      if (!canApply) return;
      onApply(tab, draft[tab]);
      dismiss();
    }, [canApply, onApply, tab, draft, dismiss]);

    const reset = useCallback(() => {
      setDraft((prev) => ({ ...prev, [tab]: EMPTY_HOME_FILTERS }));
      onReset(tab);
    }, [tab, onReset]);

    // Figma: إعادة التعيين on the left, عرض النتائج (grey until something
    // is set) on the right
    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            className="flex-row items-center bg-white p-[16px]"
            style={{ gap: 16, paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <TouchableOpacity
              testID="home-filter-apply"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canApply }}
              activeOpacity={0.8}
              disabled={!canApply}
              onPress={apply}
              className="h-[48px] flex-1 items-center justify-center rounded-[24px] px-[8px]"
              style={{ backgroundColor: canApply ? '#15304D' : '#A6A6A6' }}
            >
              <Text className="font-cairo-bold text-[14px] tracking-[0.28px] text-white">
                عرض النتائج
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="home-filter-reset"
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={reset}
              className="h-[48px] w-[100px] items-center justify-center rounded-[24px]"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[21px] tracking-[0.28px] text-[#15304D]">
                إعادة التعيين
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      ),
      [insets.bottom, canApply, apply, reset],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
        // Opens on the list the home shows, with what it's filtered by
        onAnimate={(from, to) => {
          if (from === -1 && to >= 0) {
            setTab(initialTab);
            setDraft(applied);
          }
        }}
      >
        <View testID="home-filter-sheet" className="flex-1 bg-white">
          {/* Title, with ✕ on the left */}
          <View className="flex-row items-center justify-between py-[6px] pl-[10px] pr-[16px]">
            <Text className="flex-1 font-cairo-semibold text-[18px] leading-[22px] text-[#111111]">
              تصفية البحث
            </Text>
            <TouchableOpacity
              testID="home-filter-close"
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={dismiss}
              className="size-[32px] items-center justify-center rounded-[64px] p-[4px]"
            >
              <Image
                source={require('@/assets/icons/home/filter/close.svg')}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>

          {/* بيع / ايجار / بدل / مكاتب */}
          <View className="mt-[2px] flex-row border-b border-[#EBECEE] px-[16px]">
            {HOME_FILTER_TABS.map((option) => {
              const active = option.id === tab;
              return (
                <TouchableOpacity
                  key={option.id}
                  testID={`home-filter-tab-${option.id}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  activeOpacity={0.7}
                  onPress={() => setTab(option.id)}
                  className="h-[44px] flex-1 items-center justify-between pt-[14px]"
                >
                  <Text
                    className={`text-[15px] leading-[18px] tracking-[-0.408px] ${
                      active
                        ? 'font-almarai-bold text-[#15304D]'
                        : 'font-almarai text-[#6B6A6A]'
                    }`}
                  >
                    {option.label}
                  </Text>
                  <View
                    className="h-[2px] w-full rounded-t-[6px]"
                    style={{ backgroundColor: active ? '#15304D' : 'transparent' }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 120,
              gap: 24,
            }}
          >
            <View className="flex-row" style={{ gap: 8 }}>
              <PickerField
                testID="home-filter-governorate"
                label="المحافظة"
                value={governorate?.label}
                placeholder="اختر المحافظة"
                onPress={() => governorateRef.current?.present()}
              />
              <PickerField
                testID="home-filter-area"
                label="المنطقة"
                value={area?.label}
                placeholder="اختر المنطقة"
                // An area belongs to a governorate: that first
                onPress={() =>
                  (filters.governorateId ? areaRef : governorateRef).current?.present()
                }
              />
            </View>

            {tab === 'exchange' && (
              <>
                <View className="flex-row" style={{ gap: 8 }}>
                  <NumberField
                    testID="home-filter-request-year"
                    label="سنة الطلب"
                    value={filters.requestYear}
                    placeholder="2019"
                    maxLength={4}
                    onChange={(requestYear) => update({ requestYear })}
                  />
                  <NumberField
                    testID="home-filter-required-year"
                    label="السنة المطلوبة"
                    value={filters.requiredYear}
                    placeholder="2023"
                    maxLength={4}
                    onChange={(requiredYear) => update({ requiredYear })}
                  />
                </View>
                <View style={{ gap: 12 }}>
                  <Text className={LABEL}>الحالة</Text>
                  <View className="flex-row" style={{ gap: 14 }}>
                    {EXCHANGE_CATEGORIES.map((option) => (
                      <Chip
                        key={option.id}
                        testID={`home-filter-exchange-${option.id}`}
                        label={option.label}
                        selected={filters.exchangeCategory === option.id}
                        onPress={() =>
                          update({
                            exchangeCategory:
                              filters.exchangeCategory === option.id ? '' : option.id,
                          })
                        }
                      />
                    ))}
                  </View>
                </View>
              </>
            )}

            {(tab === 'sale' || tab === 'rent') && (
              <View style={{ gap: 12 }}>
                <Text className={LABEL}>فئة العقار</Text>
                <View className="flex-row flex-wrap" style={{ rowGap: 10, columnGap: 8 }}>
                  {SALE_RENT_CATEGORIES.map((option) => (
                    <Chip
                      key={option.id}
                      testID={`home-filter-category-${option.id}`}
                      label={option.label}
                      selected={filters.categories.includes(option.id)}
                      onPress={() => toggleCategory(option.id)}
                    />
                  ))}
                </View>
              </View>
            )}

            {tab !== 'offices' && (
              <View className="flex-row">
                <NumberField
                  testID="home-filter-max-price"
                  label="السعر"
                  value={filters.maxPrice}
                  placeholder="200,000 د.ك"
                  maxLength={13}
                  format={withCommas}
                  onChange={(maxPrice) => update({ maxPrice })}
                />
              </View>
            )}
          </BottomSheetScrollView>
        </View>

        <SelectionDrawer
          ref={governorateRef}
          title="اختر المحافظة"
          data={GOVERNORATES}
          selectedItem={governorate ?? null}
          // Another governorate has other areas
          onSelect={(item) => update({ governorateId: item.id, areaId: '' })}
        />
        <SelectionDrawer
          ref={areaRef}
          title="اختر المنطقة"
          data={areas}
          selectedItem={area ?? null}
          onSelect={(item) => update({ areaId: item.id })}
        />
      </BottomSheetModal>
    );
  },
);

HomeFilterSheet.displayName = 'HomeFilterSheet';

export default HomeFilterSheet;
