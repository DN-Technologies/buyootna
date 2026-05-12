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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import AppLogo from "@/core/components/AppLogo";
import FormInput from "@/components/FormInput";
import {
  CompanyLoginFormValues,
  companyLoginSchema,
  CompanySignupFormValues,
  companySignupSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from "@/features/auth/companyAuthSchemas";
import { AccountType } from "@/core/types";
import AccountTypeBottomSheet from "@/core/components/AccountTypeBottomSheet";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import SelectionBottomSheet from "@/core/components/SelectionBottomSheet";

type AuthMode = "login" | "signup";

export default function CompanyAuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState(1);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const activitySheetRef = useRef<BottomSheetModal>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { control: loginControl, handleSubmit: handleLoginSubmit } =
    useForm<CompanyLoginFormValues>({
      resolver: zodResolver(companyLoginSchema),
      mode: "onTouched",
    });

  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    trigger,
    setValue,
    watch,
  } = useForm<CompanySignupFormValues>({
    resolver: zodResolver(companySignupSchema),
    mode: "onTouched",
  });

  const selectedActivity = watch("licenseActivity");
  const selectedExpiry = watch("licenseExpiry");

  const onLogin = (data: CompanyLoginFormValues) => {
    console.log("Company Login:", { ...data, rememberMe });
  };

  const onSignupFinal = (data: CompanySignupFormValues) => {
    console.log("Company Signup Final Data:", data);
  };

  const handleNextStep = async () => {
    let isStepValid = false;
    if (step === 1) {
      isStepValid = await trigger(STEP_1_FIELDS);
    } else if (step === 2) {
      isStepValid = await trigger(STEP_2_FIELDS);
    }

    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setValue("licenseExpiry", formattedDate, { shouldValidate: true });
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === "individual") {
      router.replace("/(auth)/individual-auth");
    }
  };

  // Helper to render the progress bar
  const renderProgressBar = () => (
    <View className="mb-6">
      <View className="flex-row justify-end mb-2">
        <Text className="text-xs text-[#6B6A6A] font-cairo-semibold">{`خطوة ${step}/3`}</Text>
      </View>
      <View
        className="flex-row h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ direction: "rtl" }}
      >
        <View
          className={`h-full bg-[#22C55E] ${step >= 1 ? "w-1/3" : "w-0"}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 2 ? "w-1/3" : "w-0"}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 3 ? "w-1/3" : "w-0"}`}
        />
      </View>
    </View>
  );
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
          {/* Header Icon */}
          <View className="items-center mb-8 mt-2">
            <View className="w-16 h-16 items-center justify-center mb-3">
              <AppLogo width={64} height={64} fill="#0B2239" />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => bottomSheetRef.current?.present()}
              className="flex-row items-center px-4 py-2 rounded-full"
            >
              <Feather name="chevron-up" size={20} color="#6B6A6A" />
              <Text className="text-lg font-semibold text-[#111111] mx-2">
                شركة
              </Text>
              <Image
                source={require("@/assets/icons/company-icon.svg")}
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
              onPress={() => {
                setMode("signup");
                setStep(1);
              }}
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

          {/* LOGIN FORM */}
          {mode === "login" && (
            <View className="flex-1">
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

              <View className="flex-row justify-between items-center w-full mb-8">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    className={`w-5 h-5 border-[1.5px] rounded mr-2 items-center justify-center ${rememberMe ? "bg-[#0B2239] border-[#0B2239]" : "border-gray-400"}`}
                  >
                    {rememberMe && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </View>
                  <Text className="text-slate-700 font-medium text-sm">
                    تذكري
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-[#0B2239] font-medium text-sm">
                    هل نسيت كلمة المرور؟
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SIGNUP FORM */}
          {mode === "signup" && (
            <View className="flex-1">
              {/* Step 1 */}
              {step === 1 && (
                <View className="flex-1">
                  <FormInput
                    control={signupControl}
                    name="name"
                    label="اسم الشركة"
                    placeholder="البنيان للمقاولات"
                  />
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
                    placeholder="61234567"
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
                </View>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <View className="flex-1">
                  <FormInput
                    control={signupControl}
                    name="services"
                    label="الخدمات"
                    placeholder="تصميم داخلي، تنفيذ صيانة، إشراف"
                  />
                  <FormInput
                    control={signupControl}
                    name="hqLocation"
                    label="المقر الرئيسي"
                    placeholder="أين يقع مقر الشركة ؟"
                  />
                  <FormInput
                    control={signupControl}
                    name="serviceAreas"
                    label="مناطق تقديم الخدمة"
                    placeholder="اختر نطاقات الخدمة"
                  />
                  {/* Notice multiline props passed down automatically to FormInput */}
                  <FormInput
                    control={signupControl}
                    name="about"
                    label="نبذة عن الشركة"
                    placeholder="نبذة تعريفية عن الشركة..."
                    multiline={true}
                    numberOfLines={6}
                    className="h-40 items-start"
                  />

                  {/* Company Logo Upload */}
                  <View className="mb-5 w-full">
                    <View className="flex-row justify-end mb-2">
                      <Text className="text-sm font-bold text-[#111111]">
                        لوجو الشركة
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-3xl items-center justify-center bg-gray-50"
                    >
                      <Feather
                        name="image"
                        size={28}
                        color="#94A3B8"
                        className="mb-2"
                      />
                      <Text className="text-[#111111] font-bold mb-1">
                        اضغط هنا لرفع اللوجو
                      </Text>
                      <Text className="text-xs text-slate-400">
                        الصيغ المدعومة: SVG, JPG, PNG
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <View className="flex-1">
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => activitySheetRef.current?.present()}
                  >
                    <FormInput
                      control={signupControl}
                      name="licenseActivity"
                      label="النشاط الرخصة"
                      placeholder="تشطيبات، بناء، ديكور، كهرباء"
                      editable={false}
                      pointerEvents="none"
                      leftIcon={
                        <Feather name="chevron-down" size={20} color="#6B6A6A" />
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <FormInput
                      control={signupControl}
                      name="licenseExpiry"
                      label="تاريخ انتهاء الرخصة"
                      placeholder="15 ابريل 2027"
                      editable={false}
                      pointerEvents="none"
                      leftIcon={
                        <Feather name="calendar" size={20} color="#6B6A6A" />
                      }
                    />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Custom UI for File Upload based on design */}
                  <View className="mb-5 w-full">
                    <View className="flex-row justify-end mb-2">
                      <Text className="text-sm font-bold text-slate-800">
                        صورة الرخصة
                      </Text>
                      <Text className="text-red-500 ml-1">*</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
                    >
                      <Feather
                        name="file-text"
                        size={28}
                        color="#94A3B8"
                        className="mb-2"
                      />
                      <Text className="text-slate-800 font-bold mb-1">
                        اضغط هنا لرفع ملف
                      </Text>
                      <Text className="text-xs text-slate-400">
                        الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* FIXED FOOTER FOR BUTTONS */}
        <View className="px-6 pb-6 bg-white">
          {mode === "login" ? (
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLoginSubmit(onLogin)}
                className="w-full py-4 rounded-3xl items-center justify-center bg-[#15304D] mb-4"
              >
                <Text className="text-lg font-bold text-white">
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} className="items-center">
                <Text className="text-[#111111] font-cairo-semibold text-base">
                  المتابعة بحساب محفوظ
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {renderProgressBar()}

              <View className="flex-row justify-between items-center w-full">
                {/* Next / Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    step < 3
                      ? handleNextStep
                      : handleSignupSubmit(onSignupFinal)
                  }
                  className="flex-1 py-4 rounded-3xl items-center justify-center bg-[#15304D]"
                >
                  <Text className="text-lg font-cairo-bold text-white">
                    {step < 3 ? "التالي" : "إنشاء حساب"}
                  </Text>
                </TouchableOpacity>

                {/* Previous Button - hidden on step 1 */}
                {step > 1 ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePrevStep}
                    className="py-4 px-6 items-center justify-center"
                  >
                    <Text className="text-lg font-cairo-semibold text-[#111111]">
                      السابق
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className={step > 1 ? "w-20" : ""} />
                )}
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <AccountTypeBottomSheet
        ref={bottomSheetRef}
        initialType="company"
        onContinue={handleAccountTypeChange}
      />

      <SelectionBottomSheet
        ref={activitySheetRef}
        title="اختر النشاط"
        options={["تشطيبات", "بناء", "ديكور", "كهرباء", "سباكة", "تكييف"]}
        selectedValue={selectedActivity}
        onSelect={(val) =>
          setValue("licenseActivity", val, { shouldValidate: true })
        }
      />
    </SafeAreaView>
  );
}
