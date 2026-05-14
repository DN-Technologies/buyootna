import { forwardRef, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

interface SuccessBottomSheetProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  // Optional: Allow you to switch to the green "document" icon for company signup later
  iconName?: keyof typeof Feather.glyphMap;
}

const SuccessBottomSheet = forwardRef<
  BottomSheetModal,
  SuccessBottomSheetProps
>(({ title, description, buttonText, onPress, iconName = "check" }, ref) => {
  const snapPoints = useMemo(() => ["40%"], []);

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
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
      backgroundStyle={{ backgroundColor: "#FFFFFF", borderRadius: 24 }}
    >
      <BottomSheetView className="flex-1 px-6 pb-8 pt-4 items-center justify-center mb-6">
        <View className="items-center mt-4">
          {/* Success Icon Circle */}
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Image
              source={require("@/assets/icons/success-icon.svg")}
              style={{ width: 74, height: 74 }}
            />
          </View>

          {/* Text Content */}
          <Text className="text-xl font-cairo-bold text-[#111111] text-center">
            {title}
          </Text>
          <Text className="text-sm text-[#6B6A6A] font-cairo-semibold mb-3 text-center leading-6 px-4">
            {description}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          className="w-full py-4 rounded-3xl items-center justify-center bg-[#15304D] mb-2"
        >
          <Text className="text-lg font-cairo-bold text-white">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SuccessBottomSheet;
