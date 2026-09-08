import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  isPhoneIdentifier,
  LoginFormValues,
  SignupFormValues,
} from '@/features/auth/authSchemas';
// Modular Components
import { IndividualAuthHeader } from '@/features/auth/components/individual/IndividualAuthHeader';
import { IndividualAuthTabs } from '@/features/auth/components/individual/IndividualAuthTabs';
import { IndividualLoginForm } from '@/features/auth/components/individual/IndividualLoginForm';
import { IndividualSignupForm } from '@/features/auth/components/individual/IndividualSignupForm';
import { IndividualSignupOtpStep } from '@/features/auth/components/individual/IndividualSignupOtpStep';
import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import apiClient from '@/shared/api/api';
import AccountTypeBottomSheet from '@/shared/components/AccountTypeBottomSheet';
import SuccessBottomSheet from '@/shared/components/SuccessBottomSheet';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { AccountType } from '@/types';

type AuthMode = 'login' | 'signup';

// Google Sign-In requires either a GoogleService-Info.plist or an iosClientId —
// calling configure() without one throws synchronously and crashes the screen,
// so only configure (and only allow the button to do anything) once real
// credentials are provided.
const GOOGLE_SIGNIN_CONFIGURED = Boolean(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
);

if (GOOGLE_SIGNIN_CONFIGURED) {
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

export default function IndividualAuthScreen() {
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(
    initialMode === 'signup' ? 'signup' : 'login',
  );
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [signupIdentifier, setSignupIdentifier] = useState('');
  // Only needed to resend an email OTP: unlike phone, no account exists yet
  // to re-request a code for, so resending re-runs the same registration
  // call, which needs the name and password again.
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  // Kept independent so each button only spins for its own action: the form
  // submit, a Google sign-in, and an Apple sign-in never bleed into each other.
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

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

  const onLogin = async (data: LoginFormValues & { rememberMe: boolean }) => {
    setIsFormLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });

      // Save token to Secure Store and update global state
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
      setIsFormLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsFormLoading(true);
    try {
      await apiClient.post('/users/register/individual', {
        name: data.name,
        identifier: data.identifier,
        password: data.password,
      });

      // Both phone (SMS) and email now send an OTP that must be verified
      // before the account exists — the backend never creates an email
      // account synchronously, to guarantee no account without a verified
      // address.
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

  const handleSocialAuthResponse = async (response: any) => {
    await setAuth(
      response.data.user,
      response.data.activeIdentity,
      response.data.identities,
      response.data.access_token,
      response.data.sessionId,
    );

    resetToIdentityHome(response.data.activeIdentity?.type);
  };

  const handleSocialAuthError = (error: any, title: string) => {
    // Only axios errors (i.e. the call to our own API) can meaningfully be
    // "check the API is running and connected" — a failure in the native
    // Google/Apple SDK itself (no .isAxiosError, no .response) has nothing to
    // do with our backend and showing that message there is misleading.
    if (error?.isAxiosError) {
      showAlert(title, getApiErrorMessage(error, 'حدث خطأ في الاتصال'));
      return;
    }

    showAlert(title, error?.message || 'حدث خطأ غير متوقع');
  };

  const onGoogleSignIn = async () => {
    if (!GOOGLE_SIGNIN_CONFIGURED) {
      showAlert('تسجيل الدخول عبر Google غير مُفعّل حالياً');
      return;
    }

    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();

      if (result.type !== 'success' || !result.data.idToken) {
        return;
      }

      const response = await apiClient.post('/auth/google', {
        idToken: result.data.idToken,
      });
      await handleSocialAuthResponse(response);
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      handleSocialAuthError(error, 'فشل تسجيل الدخول عبر Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return;
      }

      const response = await apiClient.post('/auth/apple', {
        identityToken: credential.identityToken,
      });
      await handleSocialAuthResponse(response);
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      handleSocialAuthError(error, 'فشل تسجيل الدخول عبر Apple');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const onVerifyOtp = async (otp: string) => {
    setIsFormLoading(true);
    try {
      const response = isPhoneIdentifier(signupIdentifier)
        ? await apiClient.post('/auth/register/verify-otp', {
            phone: signupIdentifier,
            otp,
          })
        : await apiClient.post('/auth/register/verify-email-otp', {
            email: signupIdentifier,
            otp,
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
    } catch (error: any) {
      showAlert('خطأ في التحقق', getApiErrorMessage(error, 'رمز التحقق غير صحيح'));
    } finally {
      setIsFormLoading(false);
    }
  };

  const onResendOtp = async () => {
    try {
      if (isPhoneIdentifier(signupIdentifier)) {
        await apiClient.post('/auth/recovery/request-otp', {
          identifier: signupIdentifier,
        });
      } else {
        // No account exists yet for a pending email signup, so there's
        // nothing to request a fresh OTP "for" — re-running registration
        // itself re-sends one.
        await apiClient.post('/users/register/individual', {
          name: signupName,
          identifier: signupIdentifier,
          password: signupPassword,
        });
      }
      showAlert('تم بنجاح', 'تم إعادة إرسال رمز التحقق');
    } catch (error: any) {
      showAlert('خطأ', getApiErrorMessage(error, 'تعذر إعادة إرسال رمز التحقق'));
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
          <IndividualAuthHeader
            onSelectAccountType={() => accountTypeSheetRef.current?.present()}
            onBack={handleBack}
          />

          {/* Auth Tabs (Login/Signup) */}
          <IndividualAuthTabs mode={mode} onChangeMode={handleModeChange} />

          {/* Render Active Form */}
          {mode === 'login' ? (
            <IndividualLoginForm
              onSubmit={onLogin}
              onOpenProfiles={() => profileSheetRef.current?.present()}
              onGooglePress={onGoogleSignIn}
              onApplePress={onAppleSignIn}
              isLoading={isFormLoading}
              isGoogleLoading={isGoogleLoading}
              isAppleLoading={isAppleLoading}
            />
          ) : signupStep === 1 ? (
            <IndividualSignupForm
              onSubmit={onSignup}
              onGooglePress={onGoogleSignIn}
              onApplePress={onAppleSignIn}
              isLoading={isFormLoading}
              isGoogleLoading={isGoogleLoading}
              isAppleLoading={isAppleLoading}
            />
          ) : (
            <IndividualSignupOtpStep
              identifier={signupIdentifier}
              onSubmit={onVerifyOtp}
              onResendOtp={onResendOtp}
              isLoading={isFormLoading}
            />
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
        onAddAccount={() => handleModeChange('signup')}
      />

      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم بنجاح"
        description="تم تفعيل حسابك وتسجيل الدخول بنجاح"
        buttonText="ابدأ الآن"
        onPress={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
