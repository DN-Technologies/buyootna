import { useState, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import {
  CompanyLoginFormValues,
  CompanySignupFormValues,
} from "@/features/auth/companyAuthSchemas";
import { AccountType } from "@/core/types";
import AccountTypeBottomSheet from "@/core/components/AccountTypeBottomSheet";

// Modular Components
import { CompanyAuthHeader } from "@/features/auth/components/company/CompanyAuthHeader";
import { CompanyAuthTabs } from "@/features/auth/components/company/CompanyAuthTabs";
import { CompanyLoginForm } from "@/features/auth/components/company/CompanyLoginForm";
import { CompanySignupForm } from "@/features/auth/components/company/CompanySignupForm";
import ProfileBottomSheet, { Profile } from "@/features/auth/components/ProfileBottomSheet";

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

export default function CompanyAuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  // Refs for the Bottom Sheets
  const accountTypeSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  const onLogin = (data: CompanyLoginFormValues & { rememberMe: boolean }) => {
    console.log("Company Login:", data);
  };

  const onSignupFinal = (data: CompanySignupFormValues) => {
    console.log("Company Signup Final Data:", data);
  };

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === "individual") {
      router.replace("/(auth)/individual-auth");
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
          <CompanyAuthHeader
            onSelectAccountType={() => accountTypeSheetRef.current?.present()}
          />

          {/* Auth Tabs (Login/Signup) */}
          <CompanyAuthTabs mode={mode} onModeChange={setMode} />

          {/* Render Active Form */}
          {mode === "login" ? (
            <CompanyLoginForm
              onSubmit={onLogin}
              onOpenProfiles={() => profileSheetRef.current?.present()}
            />
          ) : (
            <CompanySignupForm onSubmit={onSignupFinal} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AccountTypeBottomSheet
        ref={accountTypeSheetRef}
        initialType="company"
        onContinue={handleAccountTypeChange}
      />

      <ProfileBottomSheet
        ref={profileSheetRef}
        profiles={MOCK_PROFILES}
        selectedId="2"
        onSelect={handleProfileSelect}
        onAddAccount={() => setMode("signup")}
      />
    </SafeAreaView>
  );
}
