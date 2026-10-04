import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChangePasswordOtpSheet from '@/shared/components/auth/ChangePasswordOtpSheet';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { showAlert } from '@/shared/utils/alert';

import {
  CompanyEditProfileHeader,
  CompanyGeneralInfoSection,
  CompanyLicenseSection,
  CompanyLogoUpload,
  CompanySaveButton,
  KUWAIT_ACTIVITIES,
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(
        'صلاحية مطلوبة',
        'عذراً، نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك.',
      );
      return;
    }
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

  // Licence file: a document (SVG/JPG/PNG) picked from the files app
  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      profile.setLicenseFile(result.assets[0]);
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
            phoneChanged={profile.phoneChanged}
            needsPhoneVerification={profile.needsPhoneVerification}
            verifySavedPhone={profile.verifySavedPhone}
          />

          {/* 4. Section 2: الرخصة */}
          <CompanyLicenseSection
            licenseActivity={identity.licenseActivity}
            onOpenActivityModal={() => profile.setActivityModalVisible(true)}
            licenseNumber={identity.licenseNumber}
            setLicenseNumber={(val) => setIdentityField('licenseNumber', val)}
            licenseExpiry={identity.licenseExpiry}
            showDatePicker={profile.showDatePicker}
            setShowDatePicker={profile.setShowDatePicker}
            onDateChange={profile.onDateChange}
            licenseFile={profile.licenseFile}
            existingLicenseUrl={activeIdentity?.companyData?.licenseFileUrl}
            onPickLicense={pickLicense}
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
          title="اختر النشاط"
          options={KUWAIT_ACTIVITIES}
          selectedValue={identity.licenseActivity}
          onSelect={(val) => setIdentityField('licenseActivity', val)}
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
