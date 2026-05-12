import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import AppLogo from "@/core/components/AppLogo";
import FormInput from "@/components/FormInput";

import {
  LoginFormValues,
  loginSchema,
  SignupFormValues,
  signupSchema,
} from "@/features/auth/authSchemas";
import { AccountType } from "@/core/types";
import AccountTypeBottomSheet from "@/core/components/AccountTypeBottomSheet";
import { Image } from "expo-image";

type AuthMode = "login" | "signup";

export default function IndividualAuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [rememberMe, setRememberMe] = useState(false);

  // Ref for the Bottom Sheet
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const { control: loginControl, handleSubmit: handleLoginSubmit } =
    useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      mode: "onTouched",
    });

  const { control: signupControl, handleSubmit: handleSignupSubmit } =
    useForm<SignupFormValues>({
      resolver: zodResolver(signupSchema),
      mode: "onTouched",
    });

  const onLogin = (data: LoginFormValues) => {
    // Combine the form data with our custom remember me state
    console.log("Login Data:", { ...data, rememberMe });
  };

  const onSignup = (data: SignupFormValues) => {
    console.log("Signup Data:", data);
  };

  // Handle switching account type from the bottom sheet
  const handleAccountTypeChange = (type: AccountType) => {
    if (type === "company") {
      router.replace("/(auth)/company-register");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Clickable to open Bottom Sheet */}
          <View className="items-center mb-8 mt-2">
            <View className="w-16 h-16 items-center justify-center mb-3">
              <AppLogo width={64} height={64} fill="#0B2239" />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => bottomSheetRef.current?.present()}
              className="flex-row items-center  px-4 py-2 rounded-full"
            >
              <Feather name="chevron-up" size={20} color="#6B6A6A" />
              <Text className="text-lg font-semibold text-[#111111] mx-2">
                فرد
              </Text>
              <Image
                source={require("@/assets/icons/individual-icon.svg")}
                style={{
                  width: 18,
                  height: 18,
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Custom Tabs */}
          <View className="flex-row bg-[#F1F5F9] rounded-3xl p-1 mb-8">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("signup")}
              className={`flex-1 py-3 rounded-3xl items-center ${
                mode === "signup" ? "bg-[#0B2239]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  mode === "signup" ? "text-white" : "text-slate-500"
                }`}
              >
                تسجيل جديد
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("login")}
              className={`flex-1 py-3 rounded-3xl items-center ${
                mode === "login" ? "bg-[#0B2239]" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-base font-bold ${
                  mode === "login" ? "text-white" : "text-slate-500"
                }`}
              >
                تسجيل دخول
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          {mode === "login" && (
            <View className="flex-1">
              {/* 2. UPDATED INPUT: Handles identifier (email or phone) */}
              <FormInput
                control={loginControl}
                name="identifier"
                label="رقم الهاتف أو البريد الالكتروني"
                placeholder="alisalem@gmail.com"
                autoCapitalize="none"
              />

              <FormInput
                control={loginControl}
                name="password"
                label="كلمة المرور"
                placeholder="**************"
                isPassword={true}
              />

              {/* 3. Remember Me & Forgot Password */}
              <View className="flex-row justify-between items-center w-full mb-8">
                {/* Forgot Password */}
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-[#0B2239] font-medium text-sm">
                    هل نسيت كلمة المرور؟
                  </Text>
                </TouchableOpacity>

                {/* Remember Me Checkbox */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Text className="text-slate-700 font-medium text-sm">
                    تذكري
                  </Text>
                  <View
                    className={`w-5 h-5 border-[1.5px] rounded ml-2 ${
                      rememberMe
                        ? "bg-[#0B2239] border-[#0B2239]"
                        : "border-gray-400"
                    } items-center justify-center`}
                  >
                    {rememberMe && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLoginSubmit(onLogin)}
                className="w-full py-4 rounded-3xl items-center justify-center bg-[#15304D] mt-auto mb-4"
              >
                <Text className="text-lg font-bold text-white">
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>

              {/* Continue with saved account */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="items-center pb-4 mt-1"
              >
                <Text className="text-[#111111] font-cairo-semibold text-base">
                  المتابعة بحساب محفوظ
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <View className="flex-1">
              {/* ... (Keep your existing signup inputs exactly the same) ... */}
              <FormInput
                control={signupControl}
                name="email"
                label="البريد الإلكتروني"
                placeholder="alisalem@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                control={signupControl}
                name="phone"
                label="رقم الهاتف"
                placeholder="01282388770"
                keyboardType="phone-pad"
              />

              <FormInput
                control={signupControl}
                name="password"
                label="كلمة المرور"
                placeholder="**************"
                isPassword={true}
              />

              <FormInput
                control={signupControl}
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                placeholder="**************"
                isPassword={true}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSignupSubmit(onSignup)}
                className="w-full py-4 rounded-3xl items-center justify-center bg-[#15304D] mt-auto mb-4"
              >
                <Text className="text-lg font-bold text-white">إنشاء حساب</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Inject the Bottom Sheet Component */}
      <AccountTypeBottomSheet
        ref={bottomSheetRef}
        initialType="individual"
        onContinue={handleAccountTypeChange}
      />
    </SafeAreaView>
  );
}
