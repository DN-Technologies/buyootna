import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/core/api/api';
import AccountTypeBottomSheet from '@/core/components/AccountTypeBottomSheet';
import SuccessBottomSheet from '@/core/components/SuccessBottomSheet';
import { LoginFormValues, SignupFormValues } from '@/features/auth/authSchemas';
// Modular Components
import { IndividualAuthHeader } from '@/features/auth/components/individual/IndividualAuthHeader';
import { IndividualAuthTabs } from '@/features/auth/components/individual/IndividualAuthTabs';
import { IndividualLoginForm } from '@/features/auth/components/individual/IndividualLoginForm';
import { IndividualSignupForm } from '@/features/auth/components/individual/IndividualSignupForm';
import { IndividualSignupOtpStep } from '@/features/auth/components/individual/IndividualSignupOtpStep';
import ProfileBottomSheet, {
  Profile,
} from '@/features/auth/components/ProfileBottomSheet';
import { useAuthStore } from '@/store/useAuthStore';
import { AccountType } from '@/types';

const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Salim Elshekh',
    email: 'salinelshekh@gmail.com',
    type: 'individual',
    typeName: 'فرد',
    icon: require('@/assets/icons/individual-icon.svg'),
  },
  {
    id: '2',
    name: 'Kayan Company',
    email: 'kayan@gmail.com',
    type: 'company',
    typeName: 'شركة',
    icon: require('@/assets/icons/company-icon.svg'),
  },
  {
    id: '3',
    name: 'Salim Elshekh',
    email: 'salinelshekh@gmail.com',
    type: 'owner',
    typeName: 'مالك عقار',
    icon: require('@/assets/icons/owner-icon.svg'),
  },
];

type AuthMode = 'login' | 'signup';

export default function IndividualAuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [signupPhone, setSignupPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });

      // Save token to Secure Store and update global state
      await setAuth(response.data.user, response.data.access_token);

      // The router guard in _layout.tsx will automatically push them to /(main)
      router.push('/(main)/home');
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
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/register/individual', {
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      setSignupPhone(data.phone);
      setSignupStep(2);
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
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register/verify-otp', {
        phone: signupPhone,
        otp,
      });

      // Save token to Secure Store and update global state
      await setAuth(response.data.user, response.data.access_token);

      successSheetRef.current?.present();
    } catch (error: any) {
      let backendMessage = 'رمز التحقق غير صحيح';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        backendMessage = Array.isArray(message) ? message.join('\n') : message;
      }
      Alert.alert('خطأ في التحقق', backendMessage);
    } finally {
      setIsLoading(false);
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

  const handleProfileSelect = (profile: Profile) => {
    console.log('Selected Profile:', profile);
  };

  const handleSuccessClose = () => {
    successSheetRef.current?.dismiss();
    router.push('/(main)/home');
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
          <IndividualAuthTabs mode={mode} onModeChange={handleModeChange} />

          {/* Render Active Form */}
          {mode === 'login' ? (
            <IndividualLoginForm
              onSubmit={onLogin}
              onOpenProfiles={() => profileSheetRef.current?.present()}
              isLoading={isLoading}
            />
          ) : signupStep === 1 ? (
            <IndividualSignupForm onSubmit={onSignup} isLoading={isLoading} />
          ) : (
            <IndividualSignupOtpStep
              phone={signupPhone}
              onSubmit={onVerifyOtp}
              onResendOtp={onResendOtp}
              isLoading={isLoading}
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
        profiles={MOCK_PROFILES}
        selectedId="2" // Kayan Company selected as per Figma
        onSelect={handleProfileSelect}
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
