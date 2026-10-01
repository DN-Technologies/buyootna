import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AvatarPicker from '@/features/individual/components/more/AvatarPicker';
import { ChangePasswordOtpSheet } from '@/features/individual/components/more/change-password';
import {
  EditProfileHeader,
  EditProfileSubmitBar,
  EmailField,
  KuwaitPhoneField,
  NameField,
  PhoneVerificationHint,
  useEditProfile,
} from '@/features/individual/components/more/edit-profile';

export default function EditProfileScreen() {
  const profile = useEditProfile();
  const {
    control,
    formState: { errors },
  } = profile.form;
  const { phoneCheck } = profile;

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
            <NameField control={control} errors={errors} />
            <EmailField control={control} />
            <KuwaitPhoneField
              control={control}
              errors={errors}
              name="phone"
              label="رقم الهاتف"
              requiredMessage="رقم الهاتف مطلوب"
            >
              <PhoneVerificationHint
                phoneChanged={profile.phoneChanged}
                needsVerification={profile.needsPhoneVerification}
                onVerify={profile.verifySavedPhone}
              />
            </KuwaitPhoneField>
            <KuwaitPhoneField
              control={control}
              errors={errors}
              name="whatsapp"
              label="رقم الواتساب"
              requiredMessage="رقم الواتساب مطلوب"
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
    </SafeAreaView>
  );
}
