import React, { forwardRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";

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
  const snapPoints = useMemo(() => ["50%", "75%"], []);

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
    if (ref && "current" in ref && ref.current) {
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
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (ref && "current" in ref && ref.current) {
                ref.current.dismiss();
              }
            }}
            className="p-1 bg-gray-100 rounded-full"
          >
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>
          <Text className="text-xl font-cairo-semibold text-[#111111]">
            {title}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((option, index) => {
            const isSelected = selectedValue === option;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSelect(option)}
                className={`flex-row justify-between items-center py-4 border-b border-gray-100 ${isSelected ? "bg-blue-50 px-3 rounded-xl border-transparent" : ""}`}
              >
                {isSelected ? (
                  <Feather name="check-circle" size={20} color="#15304D" />
                ) : (
                  <View className="w-5" />
                )}
                <Text
                  className={`text-base font-cairo-medium text-right ${isSelected ? "text-[#15304D] font-cairo-bold" : "text-[#111111]"}`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SelectionBottomSheet;
