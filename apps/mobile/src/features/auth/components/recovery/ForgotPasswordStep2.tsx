import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  verifyOtpSchema,
  VerifyOtpValues,
} from "@/features/auth/recoverySchemas";

interface ForgotPasswordStep2Props {
  identifier: string;
  onSubmit: (data: VerifyOtpValues) => void;
}

export const ForgotPasswordStep2: React.FC<ForgotPasswordStep2Props> = ({
  identifier,
  onSubmit,
}) => {
  const [timer, setTimer] = useState(45);
  const otpInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
  });

  const otpValue = watch("otp");
  const isStep2Disabled = !otpValue || otpValue.trim() === "";

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | number;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <View className="flex-1">
      <View className="items-center mb-10 mt-6">
        <Text className="text-2xl font-cairo-bold text-charcoal mb-2">
          تحقق من الرمز
        </Text>
        <Text className="text-sm font-cairo-semibold text-gray-medium text-center px-4">
          أرسلنا رمز التحقق المكون من 6 أرقام إلى {identifier}
        </Text>
      </View>

      {/* Custom OTP Input */}
      <Controller
        control={control}
        name="otp"
        render={({ field: { onChange, value = "" }, fieldState: { error } }) => (
          <View className="mb-6 items-center">
            {/* The 6 visible boxes */}
            <View
              className="flex-row justify-between w-full"
              style={{ direction: "ltr" }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  className={`w-12 h-14 border-[1.5px] rounded-xl items-center justify-center bg-white ${
                    value.length === index
                      ? "border-secondary"
                      : error
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text className="text-xl font-cairo-bold text-charcoal">
                    {value[index] || ""}
                  </Text>
                </View>
              ))}
            </View>

            {/* The Hidden Actual Input */}
            <TextInput
              ref={otpInputRef}
              value={value}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, "");
                if (clean.length <= 6) onChange(clean);
              }}
              keyboardType="number-pad"
              maxLength={6}
              className="absolute w-full h-full opacity-0"
              autoFocus
            />

            {error && (
              <Text className="text-red-500 text-xs mt-2 font-cairo-semibold">
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* Resend Timer */}
      <View className="items-center mb-8">
        {timer > 0 ? (
          <Text className="text-gray-medium font-cairo-semibold text-sm">
            إعادة إرسال الرمز خلال 00:{timer.toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={() => setTimer(45)}>
            <Text className="text-secondary font-cairo-bold text-sm underline">
              إعادة إرسال الرمز
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
        className={`w-full py-4 rounded-3xl items-center justify-center mt-auto ${
          isStep2Disabled ? "bg-[#9CA3AF]" : "bg-secondary"
        }`}
      >
        <Text className="text-lg font-cairo-bold text-white">التحقق من الرمز</Text>
      </TouchableOpacity>
    </View>
  );
};
