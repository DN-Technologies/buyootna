import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback,useMemo } from 'react';
import { ScrollView,Text, TouchableOpacity, View } from 'react-native';

interface SelectionBottomSheetProps {
  title: string;
  options: string[];
  onSelect: (option: string) => void;
  selectedValue?: string;
}

const SelectionBottomSheet = forwardRef<
  BottomSheetModal,
  SelectionBottomSheetProps
>(({ title, options, onSelect, selectedValue }, ref) => {
  const snapPoints = useMemo(() => ['50%', '75%'], []);

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

  const handleSelect = (option: string) => {
    onSelect(option);
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
    >
      <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-cairo-semibold text-xl text-[#111111]">
            {title}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (ref && 'current' in ref && ref.current) {
                ref.current.dismiss();
              }
            }}
            className="rounded-full bg-gray-100 p-1"
          >
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((option, index) => {
            const isSelected = selectedValue === option;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSelect(option)}
                className={`flex-row items-center justify-between border-b border-gray-100 py-4 ${isSelected ? 'rounded-xl border-transparent bg-blue-50 px-3' : ''}`}
              >
                <Text
                  className={`text-right font-cairo-medium text-base ${isSelected ? 'font-cairo-bold text-[#15304D]' : 'text-[#111111]'}`}
                >
                  {option}
                </Text>
                {isSelected ? (
                  <Feather name="check-circle" size={20} color="#15304D" />
                ) : (
                  <View className="w-5" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

SelectionBottomSheet.displayName = 'SelectionBottomSheet';

export default SelectionBottomSheet;
