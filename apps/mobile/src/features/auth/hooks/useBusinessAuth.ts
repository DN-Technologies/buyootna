import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import {
  CompanyLoginFormValues,
  CompanySignupFormValues,
} from '@/features/auth/companyAuthSchemas';
import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { type PickedImage, pickSquareImage } from '@/shared/utils/pickImage';
import { AccountType } from '@/types';

import { requireTermsAccepted } from '../terms';
import { loginAs } from '../utils/loginAs';

export type BusinessAuthMode = 'login' | 'signup';
export type AuthMode = BusinessAuthMode;

export function useBusinessAuth() {
  const params = useLocalSearchParams<{
    type?: 'company' | 'office';
    mode?: string;
  }>();
  const type = params.type || 'company';

  // «إنشاء حساب» › شركة opens the sign-up; it opened on تسجيل الدخول (QA)
  const [mode, setMode] = useState<AuthMode>(
    params.mode === 'signup' ? 'signup' : 'login',
  );
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [logoFile, setLogoFile] = useState<PickedImage | null>(null);
  const [licenseFile, setLicenseFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Refs for the Bottom Sheets
  const accountTypeSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);

  // The camera or the photo library, square-cropped: it opened the Files
  // app, where people don't keep their photos (QA)
  const pickLogo = async () => {
    const picked = await pickSquareImage();
    if (picked) setLogoFile(picked);
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

  // Signs in to the company or office persona picked above, straight to its
  // dashboard (never the individual one first)
  const onLogin = async (
    data: CompanyLoginFormValues,
  ) => {
    setIsLoading(true);
    try {
      await loginAs(
        { identifier: data.identifier, password: data.password },
        type === 'office' ? 'OFFICE' : 'COMPANY',
        setAuth,
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
    if (!requireTermsAccepted()) return false;
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
      if (type === 'company') {
        // «التخصص»; the licence comes later with «طلب التوثيق»
        formData.append('specialty', data.specialty || '');
      } else {
        formData.append('licenseActivity', data.licenseActivity || '');
        formData.append('licenseNumber', data.licenseNumber || '');
        formData.append('licenseExpiry', data.licenseExpiry || '');
      }

      // 3. Append files
      if (logoFile) {
        formData.append('logo', {
          uri: logoFile.uri,
          name: logoFile.name || 'logo.jpg',
          type: logoFile.mimeType || 'image/jpeg',
        } as any);
      }

      if (type === 'office' && licenseFile) {
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
  };
}

export default useBusinessAuth;
