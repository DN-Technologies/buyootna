import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CategoryOption {
  id: string;
  label: string;
}

export const COMPANY_CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'all', label: 'الكل' },
  { id: 'تشطيب', label: 'تشطيب' },
  { id: 'ادوات صحية', label: 'ادوات صحية' },
  { id: 'شبكات نت', label: 'شبكات نت' },
  { id: 'ديكورات', label: 'ديكورات' },
  { id: 'مقاولين', label: 'مقاولين' },
  { id: 'شركات مباني', label: 'شركات مباني' },
  { id: 'الأثاث', label: 'الأثاث' },
  { id: 'ملاحات كهربائية', label: 'ملاحات كهربائية' },
  { id: 'التكييف والشفطات المركزية', label: 'التكييف & شفطات مركزية' },
  { id: 'تصميم داخلي', label: 'تصميم داخلي' },
  { id: 'معلم سيراميك ومحلات سيراميك', label: 'معلم سيراميك & محلات سيراميك' },
  { id: 'مكاتب عقارية', label: 'مكاتب عقارية' },
  { id: 'مكاتب هندسية', label: 'مكاتب هندسية' },
  { id: 'حداد', label: 'حداد' },
  { id: 'اصنصيرات', label: 'اصنصيرات' },
  { id: 'سخانات', label: 'سخانات' },
  { id: 'شركات أبواب ومعلم نجارة', label: 'شركات أبواب & معلم نجارة' },
  { id: 'شركات المنيوم', label: 'شركات المنيوم' },
  { id: 'شركات الاصباغ', label: 'شركات الاصباغ' },
  { id: 'المساح والحدائق الخارجية', label: 'المساح & الحدائق الخارجية' },
  { id: 'شركات البلاط', label: 'شركات البلاط' },
];

interface CategoryFilterSheetProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

const CategoryFilterSheet = forwardRef<
  BottomSheetModal,
  CategoryFilterSheetProps
>(({ selected, onChange }, ref) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['85%'], []);

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

  const handleClose = useCallback(() => {
    if (ref && 'current' in ref && ref.current) {
      // @ts-ignore
      ref.current.dismiss();
    }
  }, [ref]);

  const handleToggle = (item: CategoryOption) => {
    if (item.id === 'all') {
      onChange(selected.includes('all') ? [] : ['all']);
      return;
    }
    const withoutAll = selected.filter((id) => id !== 'all');
    const exists = withoutAll.includes(item.id);
    const next = exists
      ? withoutAll.filter((id) => id !== item.id)
      : [...withoutAll, item.id];
    onChange(next.length === 0 ? ['all'] : next);
  };

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          className="w-full border-t border-gray-100 bg-white px-5 pt-3.5 shadow-lg"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          }}
        >
          <View className="flex-row items-center justify-between gap-4">
            {/* --- Submit Button (عرض النتائج) - On Right in RTL --- */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              className="h-12 flex-1 items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
                عرض النتائج
              </Text>
            </TouchableOpacity>

            {/* --- Reset Button (إعادة التعيين) - On Left in RTL --- */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onChange(['all'])}
              className="items-center justify-center px-4 py-3"
            >
              <Text className="font-cairo-semibold text-sm leading-[22px] text-[#15304D]">
                إعادة التعيين
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [handleClose, insets.bottom, onChange],
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
      handleIndicatorStyle={{
        backgroundColor: '#D1D5DB',
        width: 40,
        height: 4,
      }}
    >
      <View style={{ flex: 1 }} className="bg-white">
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <Text className="font-cairo-semibold text-[18px] text-[#111111]">
            تصفية البحث
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Feather name="x" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* --- Category List --- */}
        <BottomSheetFlatList
          style={{ flex: 1 }}
          data={COMPANY_CATEGORY_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 16) + 100,
            gap: 12,
          }}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            const isAll = item.id === 'all';

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggle(item)}
                className={`h-14 flex-row items-center gap-2.5 rounded-2xl border px-4 ${
                  isSelected ? 'border-[#15304D]' : 'border-gray-200'
                }`}
              >
                {isAll ? (
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-[#15304D]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                ) : (
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-md border ${
                      isSelected
                        ? 'border-[#15304D] bg-[#15304D]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <Feather name="check" size={12} color="#FFFFFF" />
                    )}
                  </View>
                )}
                <Text
                  className="font-cairo-semibold text-sm text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </BottomSheetModal>
  );
});

CategoryFilterSheet.displayName = 'CategoryFilterSheet';

export default CategoryFilterSheet;

