import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Platform,
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
          borderColorClass = "border-primary";
        }

        return (
          <View className="mb-4 w-full">
            {/* Label */}
            <View className="flex-row-reverse justify-start mb-1 items-center">
              <Text className="text-sm font-cairo-semibold tracking-tight text-charcoal">
                {label}
              </Text>
              {isRequired && <Text className="text-red-500 mr-1 font-bold">*</Text>}
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
                className={`flex-1 text-right font-cairo-medium tracking-normal text-base text-charcoal ${
                  textInputProps.multiline ? "min-h-[100px] pt-2" : "h-full"
                }`}
                textAlign="right"
                textAlignVertical={textInputProps.multiline ? "top" : "center"}
                style={[
                  {
                    writingDirection: "rtl",
                    textAlign: "right",
                    // Fix for Cairo font vertical offset on iOS
                    paddingTop: Platform.OS === "ios" ? 4 : 0,
                  },
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
                className="text-red-500 text-xs mt-1.5 font-cairo-medium"
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
