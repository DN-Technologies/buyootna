import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";

interface IndividualAuthTabsProps {
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
}

export const IndividualAuthTabs: React.FC<IndividualAuthTabsProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <View className="flex-row bg-accent rounded-3xl p-1 mb-10 self-center w-[75%]">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onModeChange("signup")}
        className={`flex-1 py-2 rounded-3xl items-center ${
          mode === "signup" ? "bg-primary" : "bg-transparent"
        }`}
      >
        <Text
          className={`text-sm font-cairo-bold ${
            mode === "signup" ? "text-white" : "text-slate-500"
          }`}
          style={{ paddingTop: Platform.OS === "ios" ? 4 : 0 }}
        >
          تسجيل جديد
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onModeChange("login")}
        className={`flex-1 py-2 rounded-3xl items-center ${
          mode === "login" ? "bg-primary" : "bg-transparent"
        }`}
      >
        <Text
          className={`text-sm font-cairo-bold ${
            mode === "login" ? "text-white" : "text-slate-500"
          }`}
          style={{ paddingTop: Platform.OS === "ios" ? 4 : 0 }}
        >
          تسجيل دخول
        </Text>
      </TouchableOpacity>
    </View>
  );
};
