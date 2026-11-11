import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChangePasswordOtpSheet } from '@/shared/components/auth/ChangePasswordOtpSheet';
import { SPECIALTIES } from '@/shared/data/serviceCatalog';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';

import {
  CompanyEditProfileHeader,
  CompanyGeneralInfoSection,
  CompanyLicenseSection,
  CompanyLogoUpload,
  CompanySaveButton,
  KUWAIT_AREAS,
  SelectionModal,
} from './edit-profile';
import { useCompanyEditProfile } from './edit-profile/useCompanyEditProfile';

export default function CompanyEditProfile() {
  const router = useRouter();
  const { avatarUrl, activeIdentity } = useIdentity();
  const profile = useCompanyEditProfile();
  const {
    control,
    formState: { errors },
  } = profile.form;
  const { identity, setIdentityField } = profile;

  // Logo: a square-cropped gallery image (same permission pattern as the
  // individual AvatarPicker), held until save rides the multipart PATCH
  const pickLogo = async () => {
    // The system photo picker needs no permission (iOS 11+, Android):
    // asking for one left a denied user stuck with no way on (QA)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      profile.setLogoFile({
        uri: asset.uri,
        name: asset.fileName || 'logo.jpg',
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* 1. Header */}
        <CompanyEditProfileHeader onBack={() => router.back()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        >
          {/* 2. Logo Upload */}
          <CompanyLogoUpload
            avatarUri={profile.logoFile?.uri || avatarUrl}
            onPickLogo={pickLogo}
          />

          {/* 3. Section 1: عن الشركة */}
          <CompanyGeneralInfoSection
            control={control}
            errors={errors}
            identity={identity}
            setIdentityField={setIdentityField}
            onOpenServiceAreas={() => profile.setServiceAreasModalVisible(true)}
            emailNeedsCode={profile.emailNeedsCode}
            sendEmailCode={profile.sendEmailCode}
            phoneRequired={profile.phoneRequired}
            phoneChanged={profile.phoneChanged}
            needsPhoneVerification={profile.needsPhoneVerification}
            verifySavedPhone={profile.verifySavedPhone}
          />

          {/* 4. التخصص (the licence goes with «طلب التوثيق» on المزيد) */}

          <CompanyLicenseSection

            specialty={identity.specialty}

            onOpenActivityModal={() => profile.setActivityModalVisible(true)}

          />
        </ScrollView>

        {/* 5. Bottom Action Button */}
        <CompanySaveButton
          isDirty={profile.canSubmit}
          isSubmitting={profile.isSubmitting}
          onPress={profile.submit}
        />

        {/* Modals */}
        <SelectionModal
          visible={profile.activityModalVisible}
          title="اختر التخصص"
          // The services catalogue's specialties, as إضافة خدمة and طلب
          // عرض سعر
          options={SPECIALTIES}
          selectedValue={identity.specialty}
          onSelect={(val) => setIdentityField('specialty', val)}
          onClose={() => profile.setActivityModalVisible(false)}
        />

        <SelectionModal
          visible={profile.serviceAreasModalVisible}
          title="اختر مناطق تقديم الخدمة"
          options={KUWAIT_AREAS}
          selectedValue={identity.serviceAreas}
          onSelect={(val) => setIdentityField('serviceAreas', val)}
          onClose={() => profile.setServiceAreasModalVisible(false)}
        />
      </KeyboardAvoidingView>

      {/* SMS check for a new (or unverified) phone */}
      <ChangePasswordOtpSheet
        ref={profile.phoneCheck.sheetRef}
        testID="phone-otp-sheet"
        otpInputRef={profile.phoneCheck.otpInputRef}
        otp={profile.phoneCheck.otp}
        onOtpChange={profile.phoneCheck.setOtp}
        otpError={profile.phoneCheck.otpError}
        maskedPhone={profile.phoneCheck.destination}
        secondsLeft={profile.phoneCheck.secondsLeft}
        isReady={profile.phoneCheck.isReady}
        limitReachedMessage={profile.phoneCheck.limitReachedMessage}
        onResendOtp={profile.phoneCheck.resend}
        onVerifyOtp={profile.phoneCheck.verify}
        isSubmitting={profile.phoneCheck.isSubmitting}
      />

      {/* Emailed code for a new email address */}
      <ChangePasswordOtpSheet
        ref={profile.emailCheck.sheetRef}
        testID="email-otp-sheet"
        title="تحقق من البريد الإلكتروني"
        otpInputRef={profile.emailCheck.otpInputRef}
        otp={profile.emailCheck.otp}
        onOtpChange={profile.emailCheck.setOtp}
        otpError={profile.emailCheck.otpError}
        maskedPhone={profile.emailCheck.destination}
        secondsLeft={profile.emailCheck.secondsLeft}
        isReady={profile.emailCheck.isReady}
        limitReachedMessage={profile.emailCheck.limitReachedMessage}
        onResendOtp={profile.emailCheck.resend}
        onVerifyOtp={profile.emailCheck.verify}
        isSubmitting={profile.emailCheck.isSubmitting}
      />
    </SafeAreaView>
  );
}
