import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import {
  CompanyLoginFormValues,
  CompanySignupFormValues,
} from '@/features/auth/companyAuthSchemas';
import apiClient from '@/shared/api/api';
import { type ResendOtpResult } from '@/shared/hooks/verification/useOtpResendTimer';
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

  const endpoint =
    type === 'office' ? '/users/register/office' : '/users/register/company';

  // The sign-up form as sent: the first time and on «إعادة الإرسال»
  const buildSignupForm = (data: CompanySignupFormValues) => {
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

    // The account is made only once the emailed code is entered (QA)
    formData.append('verification', 'email');
    return formData;
  };

  // The form waiting for its code, and the email it went to
  const pendingSignupRef = useRef<CompanySignupFormValues | null>(null);
  const [signupEmail, setSignupEmail] = useState('');

  // «إنشاء حساب»: sends the form; the server emails a code and creates
  // nothing yet. 'otp' moves the form on to «تحقق من الرمز», its last step
  const onSignupFinal = async (
    data: CompanySignupFormValues,
  ): Promise<boolean | 'otp'> => {
    if (!requireTermsAccepted()) return false;
    setIsLoading(true);
    try {
      await apiClient.post(endpoint, buildSignupForm(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      pendingSignupRef.current = data;
      setSignupEmail(data.email || '');
      return 'otp';
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

  // The emailed code: only now is the company/office created
  const onVerifySignupOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiClient.post(`${endpoint}/verify`, { email: signupEmail, otp });
      return true;
    } catch (error: any) {
      showAlert('خطأ', getApiErrorMessage(error, 'رمز التحقق غير صحيح'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // «إعادة الإرسال»: the same form again (no account exists to send "for")
  const onResendSignupOtp = async (): Promise<ResendOtpResult> => {
    const data = pendingSignupRef.current;
    if (!data) return { success: false, message: 'انتهت جلسة التسجيل' };
    try {
      await apiClient.post(endpoint, buildSignupForm(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showAlert('تم بنجاح', 'تم إعادة إرسال رمز التحقق');
      return { success: true };
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const retryAfter = error?.response?.data?.retryAfter;
      const message = getApiErrorMessage(error, 'تعذر إعادة إرسال رمز التحقق');
      if (code !== 'OTP_COOLDOWN' && code !== 'OTP_DAILY_LIMIT') {
        showAlert('خطأ', message);
      }
      return { success: false, code, retryAfter, message };
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
    signupEmail,
    onVerifySignupOtp,
    onResendSignupOtp,
    handleAccountTypeChange,
    handleBack,
  };
}

export default useBusinessAuth;
