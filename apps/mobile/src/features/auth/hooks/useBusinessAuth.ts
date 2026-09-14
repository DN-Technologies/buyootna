import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import {
  CompanyLoginFormValues,
  CompanySignupFormValues,
} from '@/features/auth/companyAuthSchemas';
import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { AccountType } from '@/types';

// Company/office accounts stay behind the ComingSoonGate unless explicitly
// enabled via env (EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS=true) — e.g. on the
// feat/companies branch. Unset elsewhere keeps production locked.
export const COMPANY_OFFICE_LOCKED =
  process.env.EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS !== 'true';

export type BusinessAuthMode = 'login' | 'signup';
export type AuthMode = BusinessAuthMode;

export function useBusinessAuth() {
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
        response.data.sessionId,
      );
      resetToIdentityHome(response.data.activeIdentity?.type);
    } catch (error: any) {
      showAlert(
        'فشل تسجيل الدخول',
        getApiErrorMessage(error, 'حدث خطأ في الاتصال'),
      );
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
      formData.append('email', data.email || '');
      if (data.phone) {
        formData.append('phone', data.phone);
      }
      formData.append('password', data.password || '');
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
      showAlert(
        'فشل التسجيل',
        getApiErrorMessage(error, 'حدث خطأ أثناء إنشاء الحساب'),
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    type,
    mode,
    setMode,
    isLoading,
    logoFile,
    licenseFile,
    pickLogo,
    pickLicense,
    accountTypeSheetRef,
    profileSheetRef,
    onLogin,
    onSignupFinal,
    handleAccountTypeChange,
    handleBack,
    isLocked: COMPANY_OFFICE_LOCKED,
  };
}

export default useBusinessAuth;
