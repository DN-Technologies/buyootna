import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AvatarPicker from '@/features/individual/components/more/AvatarPicker';
import { ChangePasswordOtpSheet } from '@/features/individual/components/more/change-password';
import {
  EditProfileHeader,
  EditProfileSubmitBar,
  EmailField,
  EmailVerificationHint,
  KuwaitPhoneField,
  LoginMethodNote,
  NameField,
  PhoneVerificationHint,
  useEditProfile,
} from '@/features/individual/components/more/edit-profile';
import { LoginMethodToast } from '@/features/individual/components/settings/login-method';
import IdentityContactPhone from '@/shared/components/profile/IdentityContactPhone';

export default function EditProfileScreen() {
  const profile = useEditProfile();
  const {
    control,
    formState: { errors },
  } = profile.form;
  const { phoneCheck, emailCheck } = profile;
  // "(اختياري)" only once the sign-in method is known
  const methodKnown = profile.loginMethod !== null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <EditProfileHeader onBack={profile.goBack} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field: { onChange, value } }) => (
              <AvatarPicker
                currentAvatarUrl={value}
                onUploadSuccess={onChange}
              />
            )}
          />

          <View className="gap-5 px-5">
            <LoginMethodNote
              method={profile.loginMethod}
              onChange={profile.openSettings}
            />
            <NameField control={control} errors={errors} />
            <EmailField
              control={control}
              errors={errors}
              required={!methodKnown || profile.emailRequired}
            >
              <EmailVerificationHint
                visible={profile.emailNeedsCode}
                onSend={profile.sendEmailCode}
              />
            </EmailField>
            <KuwaitPhoneField
              control={control}
              errors={errors}
              name="phone"
              label="رقم الهاتف"
              requiredMessage="رقم الهاتف مطلوب"
              // Optional for an account that signs in by email; checked on save
              required={!methodKnown || profile.phoneRequired}
              requiredInForm={false}
            >
              <PhoneVerificationHint
                phoneChanged={profile.phoneChanged}
                needsVerification={profile.needsPhoneVerification}
                onVerify={profile.verifySavedPhone}
              />
            </KuwaitPhoneField>
            <IdentityContactPhone />
            <KuwaitPhoneField
              control={control}
              errors={errors}
              name="whatsapp"
              label="رقم الواتساب"
              requiredMessage="رقم الواتساب مطلوب"
              // Optional: buyers can always call or chat in the app
              required={false}
            />
          </View>
        </ScrollView>

        <EditProfileSubmitBar
          enabled={profile.canSubmit}
          onSubmit={profile.submit}
        />
      </KeyboardAvoidingView>

      {/* SMS check for a new (or unverified) phone */}
      <ChangePasswordOtpSheet
        ref={phoneCheck.sheetRef}
        testID="phone-otp-sheet"
        otpInputRef={phoneCheck.otpInputRef}
        otp={phoneCheck.otp}
        onOtpChange={phoneCheck.setOtp}
        otpError={phoneCheck.otpError}
        maskedPhone={phoneCheck.destination}
        secondsLeft={phoneCheck.secondsLeft}
        isReady={phoneCheck.isReady}
        limitReachedMessage={phoneCheck.limitReachedMessage}
        onResendOtp={phoneCheck.resend}
        onVerifyOtp={phoneCheck.verify}
        isSubmitting={phoneCheck.isSubmitting}
      />

      {/* Emailed code for a new email address */}
      <ChangePasswordOtpSheet
        ref={emailCheck.sheetRef}
        testID="email-otp-sheet"
        title="تحقق من البريد الإلكتروني"
        otpInputRef={emailCheck.otpInputRef}
        otp={emailCheck.otp}
        onOtpChange={emailCheck.setOtp}
        otpError={emailCheck.otpError}
        maskedPhone={emailCheck.destination}
        secondsLeft={emailCheck.secondsLeft}
        isReady={emailCheck.isReady}
        limitReachedMessage={emailCheck.limitReachedMessage}
        onResendOtp={emailCheck.resend}
        onVerifyOtp={emailCheck.verify}
        isSubmitting={emailCheck.isSubmitting}
      />

      {profile.toast && (
        <LoginMethodToast
          kind={profile.toast.kind}
          message={profile.toast.message}
        />
      )}
    </SafeAreaView>
  );
}
