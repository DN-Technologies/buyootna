import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import FormInput from "@/components/FormInput";
import { LoginFormValues, loginSchema } from "@/features/auth/authSchemas";

interface IndividualLoginFormProps {
  onSubmit: (data: LoginFormValues & { rememberMe: boolean }) => void;
  onOpenProfiles: () => void;
  isLoading?: boolean;
}

export const IndividualLoginForm: React.FC<IndividualLoginFormProps> = ({
  onSubmit,
  onOpenProfiles,
  isLoading = false,
}) => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const handleLogin = (data: LoginFormValues) => {
    onSubmit({ ...data, rememberMe });
  };

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="identifier"
        label="رقم الهاتف أو البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <View className="flex-row justify-between items-center w-full mb-8">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text className="text-primary font-cairo-medium text-sm">
            هل نسيت كلمة المرور؟
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <Text className="text-slate-700 font-cairo-medium text-sm">تذكري</Text>
          <View
            className={`w-5 h-5 border-[1.5px] rounded ml-2 ${
              rememberMe ? "bg-primary border-primary" : "border-gray-400"
            } items-center justify-center`}
          >
            {rememberMe && <Feather name="check" size={14} color="white" />}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(handleLogin)}
        disabled={isLoading}
        className={`w-full py-4 rounded-3xl items-center justify-center mb-4 ${isLoading ? "bg-primary/70" : "bg-primary"}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-lg font-cairo-bold text-white">تسجيل الدخول</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenProfiles}
        className="items-center pb-4 mt-1"
      >
        <Text className="text-charcoal font-cairo-semibold text-base">
          المتابعة بحساب محفوظ
        </Text>
      </TouchableOpacity>
    </View>
  );
};
