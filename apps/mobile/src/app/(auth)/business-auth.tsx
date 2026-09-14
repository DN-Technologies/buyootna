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
import ComingSoonGate from '@/shared/components/ComingSoonGate';

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
    handleAccountTypeChange,
    handleBack,
    isLocked,
  } = useBusinessAuth();

  if (isLocked) {
    return <ComingSoonGate />;
  }

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
