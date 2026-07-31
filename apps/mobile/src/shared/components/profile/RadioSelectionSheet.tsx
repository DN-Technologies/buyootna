import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioSelectionSheetProps {
  title: string;
  options: RadioOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose?: () => void;
  snapPoints?: string[];
}

const RadioSelectionSheet = forwardRef<
  BottomSheetModal,
  RadioSelectionSheetProps
>(
  (
    {
      title,
      options,
      selectedValue,
      onSelect,
      onClose,
      snapPoints: customSnapPoints,
    },
    ref,
  ) => {
    const snapPoints = useMemo(
      () => customSnapPoints || ['50%'],
      [customSnapPoints],
    );

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

    const handleDismiss = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
      if (onClose) onClose();
    };

    const handleSelectOption = (value: string) => {
      onSelect(value);
      handleDismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 44,
          height: 4,
          borderRadius: 2,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
          {/* Header Row */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismiss}
              className="p-1"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Radio Options List */}
          <View className="gap-3">
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  onPress={() => handleSelectOption(option.value)}
                  className={`h-13 w-full flex-row items-center justify-start rounded-full px-5 py-3 ${
                    isSelected
                      ? 'border-[1.5px] border-[#15304D] bg-white'
                      : 'border border-[#E2E8F0] bg-white'
                  }`}
                >
                  {/* Custom Radio Circle (Right Aligned in RTL) */}
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-[#15304D] bg-white'
                        : 'border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>

                  {/* Label Text */}
                  <Text
                    className={`ml-3 font-cairo text-base ${
                      isSelected
                        ? 'font-cairo-bold text-[#15304D]'
                        : 'font-cairo-medium text-[#111111]'
                    }`}
                  >
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

RadioSelectionSheet.displayName = 'RadioSelectionSheet';

export default RadioSelectionSheet;
