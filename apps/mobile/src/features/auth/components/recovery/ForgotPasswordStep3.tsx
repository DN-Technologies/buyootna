import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/FormInput";
import {
  resetPasswordSchema,
  ResetPasswordValues,
} from "@/features/auth/recoverySchemas";

interface ForgotPasswordStep3Props {
  onSubmit: (data: ResetPasswordValues) => void;
}

export const ForgotPasswordStep3: React.FC<ForgotPasswordStep3Props> = ({
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");
  const isStep3Disabled = !passwordValue || passwordValue.trim() === "";

  return (
    <View className="flex-1">
      <View className="items-center mb-10 mt-6">
        <Text className="text-2xl font-cairo-bold text-charcoal mb-2">
          إنشاء كلمة مرور جديدة
        </Text>
      </View>

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
        className={`w-full py-4 rounded-3xl items-center justify-center mt-auto ${
          isStep3Disabled ? "bg-[#9CA3AF]" : "bg-secondary"
        }`}
      >
        <Text className="text-lg font-cairo-bold text-white">
          تحديث كلمة المرور
        </Text>
      </TouchableOpacity>
    </View>
  );
};
