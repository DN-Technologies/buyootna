import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import AppLogo from "@/core/components/AppLogo";

interface ForgotPasswordHeaderProps {
  onBack: () => void;
}

export const ForgotPasswordHeader: React.FC<ForgotPasswordHeaderProps> = ({
  onBack,
}) => {
  return (
    <View>
      {/* Header Back Button */}
      <View className="w-min ml-auto">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          className="px-6 py-4"
        >
          <Image
            source={require("@/assets/icons/arrow-back.svg")}
            style={{ width: 12, height: 16 }}
          />
        </TouchableOpacity>
      </View>

      <View className="w-16 h-16 mx-auto items-center justify-center ">
        <AppLogo width={64} height={64} fill="#0B2239" />
      </View>
    </View>
  );
};
