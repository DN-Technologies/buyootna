import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import AppLogo from "@/core/components/AppLogo";

interface CompanyAuthHeaderProps {
  onSelectAccountType: () => void;
}

export const CompanyAuthHeader: React.FC<CompanyAuthHeaderProps> = ({
  onSelectAccountType,
}) => {
  return (
    <View className="items-center mb-0 mt-2">
      <View className="w-14 h-14 items-center justify-center mb-1">
        <AppLogo width={56} height={56} fill="#0B2239" />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSelectAccountType}
        className="flex-row items-center px-4 py-2"
      >
        <Feather name="chevron-down" size={16} color="#6B6A6A" />
        <Text className="text-base font-cairo-semibold text-charcoal mx-2">
          شركة
        </Text>
        <Image
          source={require("@/assets/icons/company-icon.svg")}
          style={{
            width: 18,
            height: 18,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};
