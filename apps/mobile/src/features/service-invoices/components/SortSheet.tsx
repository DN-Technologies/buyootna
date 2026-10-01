import { Feather } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { type InvoiceSortOption, SORT_OPTIONS } from '../types';
import SheetBackdrop from './SheetBackdrop';

interface SortSheetProps {
  selected: InvoiceSortOption;
  onSelect: (sort: InvoiceSortOption) => void;
}

// الترتيب حسب: الكل / الأحدث أولاً / الأقدم أولاً -- picking one closes it
const SortSheet = forwardRef<BottomSheetModal, SortSheetProps>(
  ({ selected, onSelect }, ref) => {
    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backdropComponent={SheetBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 44 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView className="px-5 pb-8 pt-1">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-cairo-semibold text-lg text-[#111111]">
              الترتيب حسب
            </Text>
            <TouchableOpacity
              testID="sort-sheet-close"
              activeOpacity={0.7}
              onPress={dismiss}
              className="p-1"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>
          <View className="gap-2.5">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.key === selected;
              return (
                <TouchableOpacity
                  key={option.key}
                  testID={`sort-option-${option.key}`}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onSelect(option.key);
                    dismiss();
                  }}
                  className={`h-12 w-full flex-row items-center gap-2.5 rounded-[16px] border px-4 ${
                    isSelected ? 'border-[#15304D]' : 'border-[#D7D7D7]'
                  }`}
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? 'border-[#15304D]' : 'border-[#CBD5E1]'
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="font-cairo-medium text-[14px] text-[#111111]">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SortSheet.displayName = 'SortSheet';

export default SortSheet;
