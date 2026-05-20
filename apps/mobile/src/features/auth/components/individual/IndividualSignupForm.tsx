import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/FormInput";
import { SignupFormValues, signupSchema } from "@/features/auth/authSchemas";

interface IndividualSignupFormProps {
  onSubmit: (data: SignupFormValues) => void;
  isLoading?: boolean;
}

export const IndividualSignupForm: React.FC<IndividualSignupFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="email"
        label="البريد الإلكتروني"
        placeholder="alisalem@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="phone"
        label="رقم الهاتف"
        placeholder="01282388770"
        keyboardType="phone-pad"
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        className={`w-full py-4 rounded-3xl items-center justify-center mt-6 mb-4 ${isLoading ? "bg-primary/70" : "bg-primary"}`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-lg font-cairo-bold text-white">إنشاء حساب</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
