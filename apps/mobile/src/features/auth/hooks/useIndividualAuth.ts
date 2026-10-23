import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import {
  isPhoneIdentifier,
  LoginFormValues,
  SignupFormValues,
} from '@/features/auth/authSchemas';
import apiClient from '@/shared/api/api';
import { ResendOtpResult } from '@/shared/hooks/verification/useOtpResendTimer';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { AccountType } from '@/types';

import { requireTermsAccepted } from '../terms';
import { loginAs } from '../utils/loginAs';
import { useSocialAuth } from './useSocialAuth';

export type IndividualAuthMode = 'login' | 'signup';
export type AuthMode = IndividualAuthMode;

export function useIndividualAuth() {
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(
    initialMode === 'signup' ? 'signup' : 'login',
  );
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [signupIdentifier, setSignupIdentifier] = useState('');
  // Kept so a resend can re-run the same registration call: no account
  // exists until the OTP verifies (for either phone or email), so resending
  // re-registers, which needs the name and password again.
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  // Social Auth hook
  const { isGoogleLoading, isAppleLoading, onGoogleSignIn, onAppleSignIn } =
    useSocialAuth();

  // Refs for the Bottom Sheets
  const accountTypeSheetRef = useRef<BottomSheetModal>(null);
  const profileSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setSignupStep(1);
  };

  const handleBack = () => {
    if (signupStep === 2) {
      setSignupStep(1);
    } else {
      router.back();
    }
  };

  // Signs in to the individual persona of the account (فرد picked above)
  const onLogin = async (data: LoginFormValues) => {
    setIsFormLoading(true);
    try {
      await loginAs(
        { identifier: data.identifier, password: data.password },
        'INDIVIDUAL',
        setAuth,
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    if (!requireTermsAccepted()) return;
    setIsFormLoading(true);
    try {
      await apiClient.post('/users/register/individual', {
        name: data.name,
        identifier: data.identifier,
        password: data.password,
      });

      // Both phone (SMS) and email now send an OTP that must be verified
      // before the account exists — the backend creates nothing until the
      // code checks out, to guarantee no account without a verified
      // identifier.
      setSignupIdentifier(data.identifier);
      setSignupName(data.name);
      setSignupPassword(data.password);
      setSignupStep(2);
    } catch (error: any) {
      showAlert(
        'فشل التسجيل',
        getApiErrorMessage(error, 'حدث خطأ أثناء إنشاء الحساب'),
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const onVerifyOtp = async (otp: string): Promise<boolean> => {
    setIsFormLoading(true);
    try {
      const response = isPhoneIdentifier(signupIdentifier)
        ? await apiClient.post('/auth/register/verify-otp', {
            phone: signupIdentifier,
            otp,
            // Ticked before the signup form was sent
            acceptTerms: true,
          })
        : await apiClient.post('/auth/register/verify-email-otp', {
            email: signupIdentifier,
            otp,
            acceptTerms: true,
          });

      // Save token to Secure Store and update global state
      await setAuth(
        response.data.user,
        response.data.activeIdentity,
        response.data.identities,
        response.data.access_token,
        response.data.sessionId,
      );

      successSheetRef.current?.present();
      return true;
    } catch (error: any) {
      showAlert('خطأ في التحقق', getApiErrorMessage(error, 'رمز التحقق غير صحيح'));
      return false;
    } finally {
      setIsFormLoading(false);
    }
  };

  const onResendOtp = async (): Promise<ResendOtpResult> => {
    try {
      // No account exists yet for a pending signup (phone or email), so
      // there's nothing to request a fresh OTP "for" — re-running
      // registration itself re-sends one.
      await apiClient.post('/users/register/individual', {
        name: signupName,
        identifier: signupIdentifier,
        password: signupPassword,
      });
      showAlert('تم بنجاح', 'تم إعادة إرسال رمز التحقق');
      return { success: true };
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const retryAfter = error?.response?.data?.retryAfter;
      const message = getApiErrorMessage(error, 'تعذر إعادة إرسال رمز التحقق');
      // Cooldown/daily-limit state is rendered inline by the OTP step
      // itself — an alert on top of that would just be redundant.
      if (code !== 'OTP_COOLDOWN' && code !== 'OTP_DAILY_LIMIT') {
        showAlert('خطأ', message);
      }
      return { success: false, code, retryAfter, message };
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    if (type === 'company' || type === 'office') {
      router.replace({
        pathname: '/(auth)/business-auth',
        params: { type },
      } as any);
    }
  };

  const handleSuccessClose = () => {
    successSheetRef.current?.dismiss();
    resetToIdentityHome('INDIVIDUAL');
  };

  return {
    mode,
    signupStep,
    signupIdentifier,
    isFormLoading,
    isGoogleLoading,
    isAppleLoading,
    accountTypeSheetRef,
    profileSheetRef,
    successSheetRef,
    handleModeChange,
    handleBack,
    handleAccountTypeChange,
    handleSuccessClose,
    onLogin,
    onSignup,
    onVerifyOtp,
    onResendOtp,
    onGoogleSignIn,
    onAppleSignIn,
  };
}

export default useIndividualAuth;
