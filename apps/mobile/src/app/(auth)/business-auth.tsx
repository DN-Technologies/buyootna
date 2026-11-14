import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CompanyAuthBottomSheets,
  CompanyAuthHeader,
  CompanyAuthTabs,
  CompanyLoginForm,
  CompanySignupForm,
} from '@/features/auth/components/company';
import { useBusinessAuth } from '@/features/auth/hooks';

export default function BusinessAuthScreen() {
  const {
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
    signupIdentifier,
    onVerifySignupOtp,
    onSignupDone,
    onResendSignupOtp,
    handleAccountTypeChange,
    handleBack,
  } = useBusinessAuth();

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
            onBack={handleBack}
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
              // The emailed code, last: the account is made only then (QA)
              otpEmail={signupIdentifier}
              onVerifyOtp={onVerifySignupOtp}
              // Signed in as the new profile, to its home (it opened the
              // guest home, signed out: QA)
              onSuccessDone={onSignupDone}
              onResendOtp={onResendSignupOtp}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CompanyAuthBottomSheets
        accountTypeSheetRef={accountTypeSheetRef}
        profileSheetRef={profileSheetRef}
        currentType={type}
        onAccountTypeChange={handleAccountTypeChange}
        onAddAccount={() => setMode('signup')}
      />
    </SafeAreaView>
  );
}
