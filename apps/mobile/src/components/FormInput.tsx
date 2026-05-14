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
  leftIcon?: React.ReactNode;
}

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  isPassword = false,
  isRequired = true,
  leftIcon,
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
            <View className="flex-row-reverse justify-start mb-1">
              <Text className="text-sm font-cairo-semibold leading-normal tracking-tight text-[#111111]">
                {label}
              </Text>
              {isRequired && <Text className="text-red-500 mr-px">*</Text>}
            </View>

            {/* Input Container */}
            <View
              className={`flex-row items-center border-[1.5px] rounded-xl px-4 bg-white ${borderColorClass} ${textInputProps.multiline ? "items-start pt-2" : "h-14"}`}
              style={textInputProps.multiline ? { minHeight: 120 } : {}}
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

              {leftIcon && <View className="mr-3">{leftIcon}</View>}

              {/* Text Input */}
              <TextInput
                {...textInputProps}
                className={`flex-1 text-right font-cairo-medium leading-normal tracking-normal text-base text-[#111111] ${textInputProps.multiline ? "min-h-[100px]" : "h-full"}`}
                textAlign="right"
                style={[
                  { writingDirection: "rtl", textAlign: "right" },
                  textInputProps.multiline ? { textAlignVertical: "top" } : {},
                  textInputProps.style,
                ]}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onFocus={() => setIsFocused(true)}
                onChangeText={onChange}
                value={value}
                secureTextEntry={isSecureText}
                placeholderTextColor="#9CA3AF"
                multiline={textInputProps.multiline}
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
