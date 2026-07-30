import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { router,useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/core/api/api';
import AccountTypeBottomSheet from '@/core/components/AccountTypeBottomSheet';
import {
  CompanyLoginFormValues,
  CompanySignupFormValues,
} from '@/features/auth/companyAuthSchemas';
// Modular Components
import { CompanyAuthHeader } from '@/features/auth/components/company/CompanyAuthHeader';
import { CompanyAuthTabs } from '@/features/auth/components/company/CompanyAuthTabs';
import { CompanyLoginForm } from '@/features/auth/components/company/CompanyLoginForm';
import { CompanySignupForm } from '@/features/auth/components/company/CompanySignupForm';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import { useAuthStore } from '@/store/useAuthStore';
import { AccountType } from '@/types';

type AuthMode = 'login' | 'signup';

export default function BusinessAuthScreen() {
  const params = useLocalSearchParams<{ type?: 'company' | 'office' }>();
  const type = params.type || 'company';

  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
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
      type: ['image/jpeg', 'image/png', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLogoFile(result.assets[0]);
    }
  };

  // File Picker Handlers
  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLicenseFile(result.assets[0]);
    }
  };

  const onLogin = async (
    data: CompanyLoginFormValues & { rememberMe: boolean },
  ) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });

      await setAuth(
        response.data.user,
        response.data.activeIdentity,
        response.data.identities,
        response.data.access_token,
      );
      router.replace('/(main)/home');
    } catch (error: any) {
      let errorMsg = 'حدث خطأ في الاتصال';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        errorMsg = Array.isArray(message) ? message.join('\n') : message;
      } else if (error.message === 'Network Error' || !error.response) {
        errorMsg =
          'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.';
      }
      Alert.alert('فشل تسجيل الدخول', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountTypeChange = (newType: AccountType) => {
    if (newType === 'individual') {
      router.replace('/(auth)/individual-auth');
    } else if (newType === 'office') {
      router.setParams({ type: 'office' });
    } else if (newType === 'company') {
      router.setParams({ type: 'company' });
    }
  };

  const onSignupFinal = async (data: CompanySignupFormValues) => {
    setIsLoading(true);
    try {
      // 1. Create a new FormData object
      const formData = new FormData();

      // 2. Append all text fields from React Hook Form
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('services', data.services || '');
      formData.append('hqLocation', data.hqLocation || '');
      if (type === 'company' && data.serviceAreas) {
        formData.append('serviceAreas', data.serviceAreas);
      }
      formData.append('about', data.about || '');
      formData.append('licenseActivity', data.licenseActivity || '');
      formData.append('licenseNumber', data.licenseNumber || '');
      formData.append('licenseExpiry', data.licenseExpiry || '');

      // 3. Append files
      if (logoFile) {
        formData.append('logo', {
          uri: logoFile.uri,
          name: logoFile.name || 'logo.jpg',
          type: logoFile.mimeType || 'image/jpeg',
        } as any);
      }

      if (licenseFile) {
        formData.append('license', {
          uri: licenseFile.uri,
          name: licenseFile.name || 'license.jpg',
          type: licenseFile.mimeType || 'image/jpeg',
        } as any);
      }

      // 4. Send request to the correct endpoint
      const endpoint =
        type === 'office'
          ? '/users/register/office'
          : '/users/register/company';
      await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return a flag or trigger parent state to show custom success modal
      return true;
    } catch (error: any) {
      let errorMsg = 'حدث خطأ أثناء إنشاء الحساب';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        errorMsg = Array.isArray(message) ? message.join('\n') : message;
      } else if (error.message === 'Network Error' || !error.response) {
        errorMsg =
          'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.';
      }
      Alert.alert('فشل التسجيل', errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            type={type}
            onSelectAccountType={() => accountTypeSheetRef.current?.present()}
          />

          {/* Auth Tabs (Login/Signup) */}
          <CompanyAuthTabs mode={mode} onChangeMode={setMode} />

          {/* Render Active Form */}
          {mode === 'login' ? (
            <CompanyLoginForm
              onSubmit={onLogin}
              onOpenProfiles={() => profileSheetRef.current?.present()}
              isLoading={isLoading}
            />
          ) : (
            <CompanySignupForm
              type={type}
              onSubmit={onSignupFinal}
              logoFile={logoFile}
              pickLogo={pickLogo}
              licenseFile={licenseFile}
              pickLicense={pickLicense}
              isLoading={isLoading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AccountTypeBottomSheet
        ref={accountTypeSheetRef}
        initialType={type}
        onContinue={handleAccountTypeChange}
      />

      <ProfileBottomSheet
        ref={profileSheetRef}
        onAddAccount={() => setMode('signup')}
      />
    </SafeAreaView>
  );
}
