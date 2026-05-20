import { useState, useRef } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import apiClient from "@/core/api/api";
import { useAuthStore } from "@/store/useAuthStore";

import { LoginFormValues, SignupFormValues } from "@/features/auth/authSchemas";
import { AccountType } from "@/core/types";
import AccountTypeBottomSheet from "@/core/components/AccountTypeBottomSheet";

// Modular Components
import { IndividualAuthHeader } from "@/features/auth/components/individual/IndividualAuthHeader";
import { IndividualAuthTabs } from "@/features/auth/components/individual/IndividualAuthTabs";
import { IndividualLoginForm } from "@/features/auth/components/individual/IndividualLoginForm";
import { IndividualSignupForm } from "@/features/auth/components/individual/IndividualSignupForm";
import ProfileBottomSheet, {
  Profile,
} from "@/features/auth/components/ProfileBottomSheet";

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Salim Elshekh",
    email: "salinelshekh@gmail.com",
    type: "individual",
    typeName: "فرد",
    icon: require("@/assets/icons/individual-icon.svg"),
  },
  {
    id: "2",
    name: "Kayan Company",
    email: "kayan@gmail.com",
    type: "company",
    typeName: "شركة",
    icon: require("@/assets/icons/company-icon.svg"),
  },
  {
    id: "3",
    name: "Salim Elshekh",
    email: "salinelshekh@gmail.com",
    type: "owner",
    typeName: "مالك عقار",
    icon: require("@/assets/icons/owner-icon.svg"),
  },
];

type AuthMode = "login" | "signup";

export default function IndividualAuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  // Refs for the Bottom Sheets
  const accountTypeSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  const onLogin = async (data: LoginFormValues & { rememberMe: boolean }) => {
    try {
      const response = await apiClient.post("/auth/login", {
        identifier: data.identifier,
        password: data.password,
      });

      // Save token to Secure Store and update global state
      await setAuth(response.data.user, response.data.tokens.access);

      // The router guard in _layout.tsx will automatically push them to /(main)
      router.push("/(main)/home");
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message || "حدث خطأ في الاتصال";
      Alert.alert("فشل تسجيل الدخول", backendMessage);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    try {
      await apiClient.post("/users/register/individual", {
        identifier: data.email || data.phone,
        password: data.password,
      });

      Alert.alert("تم بنجاح", "تم إنشاء الحساب بنجاح، يرجى تسجيل الدخول");
      setMode("login"); // Automatically switch them to the login tab
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب";
      Alert.alert("فشل التسجيل", backendMessage);
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === "company") {
      router.replace("/(auth)/company-auth");
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    console.log("Selected Profile:", profile);
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
          {/* Header & Account Type Selector */}
          <IndividualAuthHeader
            onSelectAccountType={() => accountTypeSheetRef.current?.present()}
          />

          {/* Auth Tabs (Login/Signup) */}
          <IndividualAuthTabs mode={mode} onModeChange={setMode} />

          {/* Render Active Form */}
          {mode === "login" ? (
            <IndividualLoginForm
              onSubmit={onLogin}
              onOpenProfiles={() => profileSheetRef.current?.present()}
            />
          ) : (
            <IndividualSignupForm onSubmit={onSignup} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AccountTypeBottomSheet
        ref={accountTypeSheetRef}
        initialType="individual"
        onContinue={handleAccountTypeChange}
      />

      <ProfileBottomSheet
        ref={profileSheetRef}
        profiles={MOCK_PROFILES}
        selectedId="2" // Kayan Company selected as per Figma
        onSelect={handleProfileSelect}
        onAddAccount={() => setMode("signup")}
      />
    </SafeAreaView>
  );
}
