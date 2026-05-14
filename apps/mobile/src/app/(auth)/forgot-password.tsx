import { useState, useRef } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import SuccessBottomSheet from "@/core/components/SuccessBottomSheet";
import {
  RequestOtpValues,
  VerifyOtpValues,
  ResetPasswordValues,
} from "@/features/auth/recoverySchemas";

// Modular Components
import { ForgotPasswordHeader } from "@/features/auth/components/recovery/ForgotPasswordHeader";
import { ForgotPasswordStep1 } from "@/features/auth/components/recovery/ForgotPasswordStep1";
import { ForgotPasswordStep2 } from "@/features/auth/components/recovery/ForgotPasswordStep2";
import { ForgotPasswordStep3 } from "@/features/auth/components/recovery/ForgotPasswordStep3";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const successSheetRef = useRef<BottomSheetModal>(null);

  const onStep1Submit = (data: RequestOtpValues) => {
    setIdentifier(data.identifier);
    setStep(2);
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
    router.replace("/(auth)/individual-auth");
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ForgotPasswordHeader onBack={handleBack} />

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
          {step === 1 && <ForgotPasswordStep1 onSubmit={onStep1Submit} />}
          {step === 2 && (
            <ForgotPasswordStep2
              identifier={identifier}
              onSubmit={onStep2Submit}
            />
          )}
          {step === 3 && <ForgotPasswordStep3 onSubmit={onStep3Submit} />}
        </ScrollView>
      </KeyboardAvoidingView>

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
