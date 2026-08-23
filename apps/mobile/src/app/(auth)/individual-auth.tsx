import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Alert } from 'react-native';
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
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
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
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [signupPhone, setSignupPhone] = useState('');
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
      );

      router.push(getIdentityHomeRoute(response.data.activeIdentity?.type));
    } catch (error: any) {
      let backendMessage = 'حدث خطأ في الاتصال';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        backendMessage = Array.isArray(message) ? message.join('\n') : message;
      } else if (error.message === 'Network Error' || !error.response) {
        backendMessage =
          'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.';
      }
      Alert.alert('فشل تسجيل الدخول', backendMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsFormLoading(true);
    try {
      await apiClient.post('/users/register/individual', {
        identifier: data.identifier,
        password: data.password,
      });

      if (isPhoneIdentifier(data.identifier)) {
        // The identifier was a phone number, so the backend sent an SMS OTP — verify it.
        setSignupPhone(data.identifier);
        setSignupStep(2);
      } else {
        // The identifier was an email, so no OTP was sent — log the user in directly.
        const loginResponse = await apiClient.post('/auth/login', {
          identifier: data.identifier,
          password: data.password,
        });

        await setAuth(
          loginResponse.data.user,
          loginResponse.data.activeIdentity,
          loginResponse.data.identities,
          loginResponse.data.access_token,
        );

        successSheetRef.current?.present();
      }
    } catch (error: any) {
      let backendMessage = 'حدث خطأ أثناء إنشاء الحساب';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        backendMessage = Array.isArray(message) ? message.join('\n') : message;
      } else if (error.message === 'Network Error' || !error.response) {
        backendMessage =
          'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.';
      }
      Alert.alert('فشل التسجيل', backendMessage);
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
    );

    router.push(getIdentityHomeRoute(response.data.activeIdentity?.type));
  };

  const handleSocialAuthError = (error: any, title: string) => {
    // Only axios errors (i.e. the call to our own API) can meaningfully be
    // "check the API is running and connected" — a failure in the native
    // Google/Apple SDK itself (no .isAxiosError, no .response) has nothing to
    // do with our backend and showing that message there is misleading.
    if (error?.isAxiosError) {
      let backendMessage = 'حدث خطأ في الاتصال';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        backendMessage = Array.isArray(message) ? message.join('\n') : message;
      } else {
        backendMessage =
          'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الـ API والاتصال بالشبكة.';
      }
      Alert.alert(title, backendMessage);
      return;
    }

    Alert.alert(title, error?.message || 'حدث خطأ غير متوقع');
  };

  const onGoogleSignIn = async () => {
    if (!GOOGLE_SIGNIN_CONFIGURED) {
      Alert.alert('تسجيل الدخول عبر Google غير مُفعّل حالياً');
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
      const response = await apiClient.post('/auth/register/verify-otp', {
        phone: signupPhone,
        otp,
      });

      // Save token to Secure Store and update global state
      await setAuth(
        response.data.user,
        response.data.activeIdentity,
        response.data.identities,
        response.data.access_token,
      );

      successSheetRef.current?.present();
    } catch (error: any) {
      let backendMessage = 'رمز التحقق غير صحيح';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        backendMessage = Array.isArray(message) ? message.join('\n') : message;
      }
      Alert.alert('خطأ في التحقق', backendMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  const onResendOtp = async () => {
    try {
      await apiClient.post('/auth/recovery/request-otp', {
        identifier: signupPhone,
      });
      Alert.alert('تم بنجاح', 'تم إعادة إرسال رمز التحقق');
    } catch {
      Alert.alert('خطأ', 'تعذر إعادة إرسال رمز التحقق');
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
    router.push(getIdentityHomeRoute('INDIVIDUAL'));
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
              phone={signupPhone}
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
