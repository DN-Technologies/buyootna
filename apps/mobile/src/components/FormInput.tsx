import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
  isPassword?: boolean;
  isRequired?: boolean;
}

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  isPassword = false,
  isRequired = true,
  ...textInputProps
}: FormInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureText, setIsSecureText] = useState(isPassword);

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error, isTouched },
      }) => {
        const hasError = !!error;
        const isSuccess =
          isTouched && !hasError && value !== undefined && value !== "";

        let borderColorClass = "border-gray-300";
        let iconColor = "#9CA3AF";

        if (hasError) {
          borderColorClass = "border-red-500";
          iconColor = "#EF4444";
        } else if (isSuccess) {
          borderColorClass = "border-green-500";
          iconColor = "#22C55E";
        } else if (isFocused) {
          borderColorClass = "border-[#0B2239]";
        }

        return (
          <View className="mb-5 w-full">
            {/* Label */}
            <View className="flex-row-reverse justify-start mb-2">
              <Text className="text-sm font-bold text-slate-800">{label}</Text>
              {isRequired && <Text className="text-red-500 ml-1">*</Text>}
            </View>

            {/* Input Container */}
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl px-4 h-14 bg-white ${borderColorClass}`}
            >
              {/* Password Eye Toggle Icon */}
              {isPassword && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsSecureText(!isSecureText)}
                  className="mr-3 p-1"
                >
                  <Feather
                    name={isSecureText ? "eye-off" : "eye"}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              )}

              {!isPassword && isSuccess && (
                <View className="mr-3 p-1">
                  <Feather name="check" size={20} color={iconColor} />
                </View>
              )}

              {/* Text Input */}
              <TextInput
                className="flex-1 text-right text-base text-slate-900 h-full"
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onFocus={() => setIsFocused(true)}
                onChangeText={onChange}
                value={value}
                secureTextEntry={isSecureText}
                placeholderTextColor="#9CA3AF"
                textAlign={I18nManager.isRTL ? "right" : "left"}
                {...textInputProps}
              />
            </View>

            {/* Error Message */}
            {hasError && (
              <Text
                className="text-red-500 text-xs mt-1.5 font-medium"
                // Forcing native RTL alignment for Arabic punctuation
                style={{ textAlign: "right", writingDirection: "rtl" }}
              >
                {error?.message as string}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
