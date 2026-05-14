import React from "react";
import { View, Text } from "react-native";

interface CompanySignupProgressProps {
  step: number;
  totalSteps: number;
}

export const CompanySignupProgress: React.FC<CompanySignupProgressProps> = ({
  step,
  totalSteps,
}) => {
  return (
    <View className="mb-6">
      <View className="flex-row justify-end mb-2">
        <Text className="text-xs text-gray-medium font-cairo-semibold">
          {`خطوة ${step}/${totalSteps}`}
        </Text>
      </View>
      <View
        className="flex-row h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ direction: "rtl" }}
      >
        <View
          className={`h-full bg-[#22C55E] ${step >= 1 ? "w-1/3" : "w-0"}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 2 ? "w-1/3" : "w-0"}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 3 ? "w-1/3" : "w-0"}`}
        />
      </View>
    </View>
  );
};
