import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import FormInput from "@/components/FormInput";
import {
  CompanyLoginFormValues,
  companyLoginSchema,
} from "@/features/auth/companyAuthSchemas";

interface CompanyLoginFormProps {
  onSubmit: (data: CompanyLoginFormValues & { rememberMe: boolean }) => void;
  onOpenProfiles: () => void;
}

export const CompanyLoginForm: React.FC<CompanyLoginFormProps> = ({
  onSubmit,
  onOpenProfiles,
}) => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit } = useForm<CompanyLoginFormValues>({
    resolver: zodResolver(companyLoginSchema),
    mode: "onTouched",
  });

  const handleLogin = (data: CompanyLoginFormValues) => {
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
          className="flex-row items-center"
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            className={`w-5 h-5 border-[1.5px] rounded mr-2 items-center justify-center ${
              rememberMe ? "bg-primary border-primary" : "border-gray-400"
            }`}
          >
            {rememberMe && <Feather name="check" size={14} color="white" />}
          </View>
          <Text className="text-slate-700 font-cairo-medium text-sm">تذكري</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text className="text-primary font-cairo-medium text-sm">
            هل نسيت كلمة المرور؟
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit(handleLogin)}
          className="w-full py-4 rounded-3xl items-center justify-center bg-primary mb-4"
        >
          <Text className="text-lg font-cairo-bold text-white">تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenProfiles}
          className="items-center"
        >
          <Text className="text-charcoal font-cairo-semibold text-base">
            المتابعة بحساب محفوظ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
