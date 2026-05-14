import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import FormInput from "@/components/FormInput";
import SuccessBottomSheet from "@/core/components/SuccessBottomSheet";
import {
  requestOtpSchema,
  RequestOtpValues,
  verifyOtpSchema,
  VerifyOtpValues,
  resetPasswordSchema,
  ResetPasswordValues,
} from "@/features/auth/recoverySchemas";
import { Image } from "expo-image";
import AppLogo from "@/core/components/AppLogo";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState(""); // Store email/phone to show in Step 2
  const [timer, setTimer] = useState(45); // 45 seconds timer

  const successSheetRef = useRef<BottomSheetModal>(null);
  const otpInputRef = useRef<TextInput>(null);

  // --- Forms ---
  const {
    control: step1Control,
    handleSubmit: submitStep1,
    watch: watchStep1,
  } = useForm<RequestOtpValues>({
    resolver: zodResolver(requestOtpSchema),
    mode: "onChange",
  });
  const identifierValue = watchStep1("identifier");
  const isStep1Disabled = !identifierValue || identifierValue.trim() === "";

  const {
    control: step2Control,
    handleSubmit: submitStep2,
    watch: watchStep2,
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
  });
  const otpValue = watchStep2("otp");
  const isStep2Disabled = !otpValue || otpValue.trim() === "";

  const {
    control: step3Control,
    handleSubmit: submitStep3,
    watch: watchStep3,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });
  const passwordValue = watchStep3("password");
  const isStep3Disabled = !passwordValue || passwordValue.trim() === "";

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout | number;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Handlers ---
  const onStep1Submit = (data: RequestOtpValues) => {
    setIdentifier(data.identifier);
    setStep(2);
    setTimer(45); // Reset timer
  };

  const onStep2Submit = (data: VerifyOtpValues) => {
    console.log("OTP Verified: ", data.otp);
    setStep(3);
  };

  const onStep3Submit = (data: ResetPasswordValues) => {
    console.log("Password Reset: ", data);
    successSheetRef.current?.present();
  };

  const handleSuccessClose = () => {
    successSheetRef.current?.dismiss();
    router.replace("/(auth)/individual-auth"); // Route back to login
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Back Button */}
      <View className="w-min ml-auto">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            step > 1 ? setStep((prev) => (prev - 1) as any) : router.back()
          }
          className="px-6 py-4"
        >
          <Image
            source={require("@/assets/icons/arrow-back.svg")}
            style={{ width: 12, height: 16 }}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          <View className="w-16 h-16 mx-auto items-center justify-center ">
            <AppLogo width={64} height={64} fill="#0B2239" />
          </View>

          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <View className="flex-1">
              <View className="items-center mb-10 mt-1">
                <Text className="text-2xl font-cairo-semibold leading-tight tracking-normal text-[#111111]">
                  نسيت كلمة المرور؟
                </Text>
                <Text className="text-sm font-cairo-medium text-[#6B6A6A] leading-normal tracking-normal text-center px-4">
                  أدخل رقم الهاتف أو البريد الالكتروني المرتبط بحسابك
                </Text>
              </View>

              <FormInput
                control={step1Control}
                name="identifier"
                label="رقم الهاتف أو البريد الالكتروني"
                placeholder="alisalem@gmail.com"
                autoCapitalize="none"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={submitStep1(onStep1Submit)}
                className={`w-full py-4 rounded-3xl items-center justify-center  mt-auto ${isStep1Disabled ? "bg-[#A6A6A6]" : "bg-[#15304D]"}`}
              >
                <Text className="text-lg font-cairo-bold text-white">
                  إرسال رمز التحقق
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <View className="flex-1">
              <View className="items-center mb-10 mt-6">
                <Text className="text-2xl font-cairo-bold text-[#111111] mb-2">
                  تحقق من الرمز
                </Text>
                <Text className="text-sm font-cairo-semibold text-[#6B6A6A] text-center px-4">
                  أرسلنا رمز التحقق المكون من 6 أرقام إلى {identifier}
                </Text>
              </View>

              {/* Custom OTP Input */}
              <Controller
                control={step2Control}
                name="otp"
                render={({
                  field: { onChange, value = "" },
                  fieldState: { error },
                }) => (
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
                              ? "border-[#15304D]"
                              : error
                                ? "border-red-500"
                                : "border-gray-300"
                          }`}
                        >
                          <Text className="text-xl font-cairo-bold text-[#111111]">
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
                        // Only allow numbers and max length 6
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
                  <Text className="text-[#6B6A6A] font-cairo-semibold text-sm">
                    إعادة إرسال الرمز خلال 00:
                    {timer.toString().padStart(2, "0")}
                  </Text>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setTimer(45)}
                  >
                    <Text className="text-[#15304D] font-cairo-bold text-sm underline">
                      إعادة إرسال الرمز
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={submitStep2(onStep2Submit)}
                className={`w-full py-4 rounded-3xl items-center justify-center mt-auto ${
                  isStep2Disabled ? "bg-[#9CA3AF]" : "bg-[#15304D]"
                }`}
              >
                <Text className="text-lg font-cairo-bold text-white">
                  التحقق من الرمز
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Create New Password */}
          {step === 3 && (
            <View className="flex-1">
              <View className="items-center mb-10 mt-6">
                <Text className="text-2xl font-cairo-bold text-[#111111] mb-2">
                  إنشاء كلمة مرور جديدة
                </Text>
              </View>

              <FormInput
                control={step3Control}
                name="password"
                label="كلمة المرور"
                placeholder="**************"
                isPassword={true}
              />
              <FormInput
                control={step3Control}
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                placeholder="**************"
                isPassword={true}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={submitStep3(onStep3Submit)}
                className={`w-full py-4 rounded-3xl items-center justify-center mt-auto ${
                  isStep3Disabled ? "bg-[#9CA3AF]" : "bg-[#15304D]"
                }`}
              >
                <Text className="text-lg font-cairo-bold text-white">
                  تحديث كلمة المرور
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Bottom Sheet Modal */}
      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم تحديث كلمة المرور بنجاح"
        description="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
        buttonText="تسجيل الدخول"
        onPress={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
