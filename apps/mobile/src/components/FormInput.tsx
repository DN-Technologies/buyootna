import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
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
        // Determine the current state
        const hasError = !!error;
        // Success state: user interacted with it, it has a value, and no validation errors
        const isSuccess =
          isTouched && !hasError && value !== undefined && value !== "";

        // Dynamic styling based on state
        let borderColorClass = "border-gray-300";
        let iconColor = "#9CA3AF"; // Default Gray

        if (hasError) {
          borderColorClass = "border-red-500";
          iconColor = "#EF4444"; // Red
        } else if (isSuccess) {
          borderColorClass = "border-green-500";
          iconColor = "#22C55E"; // Green
        } else if (isFocused) {
          borderColorClass = "border-[#0B2239]"; // Active Dark Blue
          iconColor = "#9CA3AF"; // Keep icon gray when focused
        }

        return (
          <View className="mb-5 w-full">
            {/* Label */}
            <View className="flex-row mb-2">
              <Text className="text-sm font-bold text-slate-800 text-right">
                {label}
              </Text>
              {isRequired && <Text className="text-red-500 ml-1">*</Text>}
            </View>

            {/* Input Container */}
            <View
              className={`flow-row items-center border-[1.5px] rounded-xl px-4 py-3 bg-white ${borderColorClass}`}
            >
              {/* Text Input */}
              <TextInput
                className="flex-1 text-right text-base text-slate-900 font-medium"
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                onFocus={() => setIsFocused(true)}
                onChangeText={onChange}
                value={value}
                secureTextEntry={isSecureText}
                placeholderTextColor="#9CA3AF"
                // Native layout fix for Arabic typing
                textAlign={I18nManager.isRTL ? "right" : "left"}
                {...textInputProps}
              />

              {/* Password Eye Toggle Icon */}
              {isPassword && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsSecureText(!isSecureText)}
                  className="ml-3" // Adds spacing between icon and text
                >
                  <Feather
                    name={isSecureText ? "eye-off" : "eye"}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              )}

              {/* Optional: Show checkmark if not a password field but successful */}
              {!isPassword && isSuccess && (
                <Feather
                  name="check"
                  size={20}
                  color={iconColor}
                  className="ml-3"
                />
              )}
            </View>

            {/* Error Message */}
            {hasError && (
              <Text className="text-red-500 text-xs mt-1.5 text-right font-medium">
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
