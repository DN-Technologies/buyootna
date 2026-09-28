import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';

import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { notifyIfReactivated } from '@/shared/utils/reactivationNotice';

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

export function useSocialAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSocialAuthResponse = async (response: any) => {
    await setAuth(
      response.data.user,
      response.data.activeIdentity,
      response.data.identities,
      response.data.access_token,
      response.data.sessionId,
    );
    notifyIfReactivated(response.data);

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

  return {
    isGoogleLoading,
    isAppleLoading,
    onGoogleSignIn,
    onAppleSignIn,
  };
}

export default useSocialAuth;
