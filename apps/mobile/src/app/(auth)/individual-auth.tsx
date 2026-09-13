import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  IndividualAuthBottomSheets,
  IndividualAuthHeader,
  IndividualAuthTabs,
  IndividualLoginForm,
  IndividualSignupForm,
  IndividualSignupOtpStep,
} from '@/features/auth/components/individual';
import { useIndividualAuth } from '@/features/auth/hooks';

export default function IndividualAuthScreen() {
  const {
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
  } = useIndividualAuth();

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

      <IndividualAuthBottomSheets
        accountTypeSheetRef={accountTypeSheetRef}
        profileSheetRef={profileSheetRef}
        successSheetRef={successSheetRef}
        onAccountTypeChange={handleAccountTypeChange}
        onAddAccount={() => handleModeChange('signup')}
        onSuccessClose={handleSuccessClose}
      />
    </SafeAreaView>
  );
}
