import { useState, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

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
import ProfileBottomSheet, {
  Profile,
} from "@/features/auth/components/ProfileBottomSheet";
import apiClient from "@/core/api/api";
import { useAuthStore } from "@/store/useAuthStore";

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
  const [mode, setMode] = useState<AuthMode>("login");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [logoFile, setLogoFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [licenseFile, setLicenseFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Refs for the Bottom Sheets
  const accountTypeSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  const pickLogo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "image/svg+xml"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLogoFile(result.assets[0]);
    }
  };

  // File Picker Handlers
  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLicenseFile(result.assets[0]);
    }
  };

  const onLogin = async (
    data: CompanyLoginFormValues & { rememberMe: boolean },
  ) => {
    try {
      const response = await apiClient.post("/auth/login", {
        identifier: data.identifier,
        password: data.password,
      });

      await setAuth(response.data.user, response.data.access_token);
      router.replace("/(main)/home");
    } catch (error: any) {
      Alert.alert(
        "فشل تسجيل الدخول",
        error.response?.data?.message || "حدث خطأ في الاتصال",
      );
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === "individual") {
      router.replace("/(auth)/individual-auth");
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    console.log("Selected Profile:", profile);
  };

  const onSignupFinal = async (data: CompanySignupFormValues) => {
    try {
      // 1. Create a new FormData object
      const formData = new FormData();

      // 2. Append all text fields from React Hook Form
      formData.append("name", data.name);
      formData.append("identifier", data.email || data.phone);
      formData.append("password", data.password);
      formData.append("services", data.services);
      formData.append("hqLocation", data.hqLocation);
      formData.append("serviceAreas", data.serviceAreas);
      formData.append("about", data.about);
      formData.append("licenseActivity", data.licenseActivity || "");
      formData.append("licenseExpiry", data.licenseExpiry || "");

      // 3. Append files (React Native requires this specific object structure)
      if (logoFile) {
        formData.append("logo", {
          uri: logoFile.uri,
          name: logoFile.name || "logo.jpg",
          type: logoFile.mimeType || "image/jpeg",
        } as any);
      }

      if (licenseFile) {
        formData.append("license", {
          uri: licenseFile.uri,
          name: licenseFile.name || "license.jpg",
          type: licenseFile.mimeType || "image/jpeg",
        } as any);
      }

      // 4. Send request (Axios will automatically set the correct Boundary headers)
      const response = await apiClient.post(
        "/users/register/company",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Alert.alert("تم بنجاح", "تم إنشاء حساب الشركة بنجاح، يرجى تسجيل الدخول");
      setMode("login");
    } catch (error: any) {
      Alert.alert(
        "فشل التسجيل",
        error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب",
      );
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
            <CompanySignupForm
              onSubmit={onSignupFinal}
              logoFile={logoFile}
              pickLogo={pickLogo}
              licenseFile={licenseFile}
              pickLicense={pickLicense}
            />
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
