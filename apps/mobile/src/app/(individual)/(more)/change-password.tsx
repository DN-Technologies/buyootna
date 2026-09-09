import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChangePasswordForm,
  ChangePasswordHeader,
  ChangePasswordOtpSheet,
  useChangePassword,
} from '@/features/individual/components/more/change-password';

export default function ChangePasswordScreen() {
  const {
    control,
    handleSubmit,
    onSubmitForm,
    isRequestingOtp,
    isSubmitting,
    bottomSheetRef,
    otpInputRef,
    otp,
    setOtp,
    otpError,
    secondsLeft,
    isReady,
    limitReachedMessage,
    maskedPhone,
    handleResendOtp,
    handleVerifyOtp,
    handleBack,
  } = useChangePassword();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Header --- */}
      <ChangePasswordHeader onBack={handleBack} />

      {/* --- Form Section --- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          className="flex-1"
        >
          <ChangePasswordForm
            control={control}
            onSubmit={handleSubmit(onSubmitForm)}
            isSubmitting={isRequestingOtp || isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- OTP Verification Bottom Sheet --- */}
      <ChangePasswordOtpSheet
        ref={bottomSheetRef}
        otpInputRef={otpInputRef}
        otp={otp}
        onOtpChange={setOtp}
        otpError={otpError}
        maskedPhone={maskedPhone}
        secondsLeft={secondsLeft}
        isReady={isReady}
        limitReachedMessage={limitReachedMessage}
        onResendOtp={handleResendOtp}
        onVerifyOtp={handleVerifyOtp}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}
