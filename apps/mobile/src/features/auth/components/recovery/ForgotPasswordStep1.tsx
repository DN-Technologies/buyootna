import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/FormInput";
import {
  requestOtpSchema,
  RequestOtpValues,
} from "@/features/auth/recoverySchemas";

interface ForgotPasswordStep1Props {
  onSubmit: (data: RequestOtpValues) => void;
}

export const ForgotPasswordStep1: React.FC<ForgotPasswordStep1Props> = ({
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    mode: "onChange",
  });

  const identifierValue = watch("identifier");
  const isStep1Disabled = !identifierValue || identifierValue.trim() === "";

  return (
    <View className="flex-1">
      <View className="items-center mb-10 mt-1">
        <Text className="text-2xl font-cairo-semibold leading-tight tracking-normal text-charcoal">
          نسيت كلمة المرور؟
        </Text>
        <Text className="text-sm font-cairo-medium text-gray-medium leading-normal tracking-normal text-center px-4">
          أدخل رقم الهاتف أو البريد الالكتروني المرتبط بحسابك
        </Text>
      </View>

      <FormInput
        control={control}
        name="identifier"
        label="رقم الهاتف أو البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        autoCapitalize="none"
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        className={`w-full py-4 rounded-3xl items-center justify-center mt-auto ${
          isStep1Disabled ? "bg-[#A6A6A6]" : "bg-secondary"
        }`}
      >
        <Text className="text-lg font-cairo-bold text-white">
          إرسال رمز التحقق
        </Text>
      </TouchableOpacity>
    </View>
  );
};
