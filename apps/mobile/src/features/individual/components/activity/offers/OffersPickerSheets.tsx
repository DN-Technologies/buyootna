import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, ReactNode, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CheckboxIcon,
  RadioIcon,
  RequestCloseIcon,
} from '@/assets/icons/activity';

export type OffersSort = 'all' | 'newest' | 'oldest';

const SORT_OPTIONS: { value: OffersSort; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'newest', label: 'الأحدث أولاً' },
  { value: 'oldest', label: 'الأقدم أولاً' },
];

// Figma "input" row: 46px, radius 16, 1px border (navy when selected)
function PickerRow({
  label,
  selected,
  icon,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  icon: ReactNode;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      activeOpacity={0.8}
      onPress={onPress}
      className="h-[46px] w-full flex-row items-center gap-1 rounded-[16px] px-4"
      style={{
        borderWidth: 1,
        borderColor: selected ? '#15304D' : '#D7D7D7',
      }}
    >
      {icon}
      <Text
        className="flex-1 font-cairo-medium text-[14px] leading-[21px]"
        style={{
          color: selected ? '#15304D' : '#111111',
          writingDirection: 'rtl',
          letterSpacing: -0.408,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Handle, "title + ✕" header, then the rows
const PickerShell = forwardRef<
  BottomSheetModal,
  { title: string; children: ReactNode }
>(({ title, children }, ref) => {
  const insets = useSafeAreaInsets();
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

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <BottomSheetView>
        <View
          className="gap-4 px-4"
          style={{ paddingBottom: Math.max(insets.bottom, 48) }}
        >
          <View className="flex-row items-center py-[6px]">
            <Text
              testID="picker-title"
              className="flex-1 font-cairo-semibold text-[18px] leading-[26px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {title}
            </Text>
            <TouchableOpacity
              testID="picker-close"
              accessibilityLabel="إغلاق"
              activeOpacity={0.7}
              onPress={() => (ref as any)?.current?.dismiss()}
              className="h-8 w-8 items-center justify-center rounded-[64px]"
            >
              <RequestCloseIcon />
            </TouchableOpacity>
          </View>
          <View className="gap-3">{children}</View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
PickerShell.displayName = 'PickerShell';

interface OffersSortSheetProps {
  value: OffersSort;
  onChange: (value: OffersSort) => void;
}

/** "الترتيب حسب": الكل / الأحدث أولاً / الأقدم أولاً. */
export const OffersSortSheet = forwardRef<BottomSheetModal, OffersSortSheetProps>(
  ({ value, onChange }, ref) => (
    <PickerShell ref={ref} title="الترتيب حسب">
      {SORT_OPTIONS.map((option) => (
        <PickerRow
          key={option.value}
          testID={`offers-sort-${option.value}`}
          label={option.label}
          selected={value === option.value}
          icon={<RadioIcon selected={value === option.value} />}
          onPress={() => {
            onChange(option.value);
            (ref as any)?.current?.dismiss();
          }}
        />
      ))}
    </PickerShell>
  ),
);
OffersSortSheet.displayName = 'OffersSortSheet';

interface OffersFilterSheetProps {
  // Service categories present in the user's requests
  categories: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** "تصفية البحث": الكل, then one checkbox per service category. */
export const OffersFilterSheet = forwardRef<
  BottomSheetModal,
  OffersFilterSheetProps
>(({ categories, selected, onChange }, ref) => (
  <PickerShell ref={ref} title="تصفية البحث">
    <PickerRow
      testID="offers-filter-all"
      label="الكل"
      selected={selected.length === 0}
      icon={<RadioIcon selected={selected.length === 0} />}
      onPress={() => onChange([])}
    />
    {categories.map((category) => {
      const checked = selected.includes(category);
      return (
        <PickerRow
          key={category}
          testID={`offers-filter-${category}`}
          label={category}
          selected={false}
          icon={<CheckboxIcon checked={checked} />}
          onPress={() =>
            onChange(
              checked
                ? selected.filter((c) => c !== category)
                : [...selected, category],
            )
          }
        />
      );
    })}
  </PickerShell>
));
OffersFilterSheet.displayName = 'OffersFilterSheet';
