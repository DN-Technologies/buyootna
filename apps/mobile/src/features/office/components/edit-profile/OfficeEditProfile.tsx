import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CompanyEditProfileHeader as OfficeEditProfileHeader,
  CompanyLogoUpload as OfficeLogoUpload,
  CompanySaveButton as OfficeSaveButton,
  KUWAIT_ACTIVITIES,
  SelectionModal,
} from '@/features/company/components/edit-profile';
import apiClient from '@/shared/api/api';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import OfficeGeneralInfoSection from './OfficeGeneralInfoSection';
import OfficeLicenseSection from './OfficeLicenseSection';

export default function OfficeEditProfile() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const { activeIdentity, displayName, avatarUrl } = useIdentity();

  const officeData = activeIdentity?.officeData;

  // Helper to strip Kuwait prefix for display next to +965 pill
  const stripKuwaitPrefix = (val?: string | null) => {
    if (!val) return '';
    return val.replace(/^(?:\+?965)/, '');
  };

  // Initial values
  const initialValues = useMemo(
    () => ({
      name: officeData?.name || displayName || 'المنار',
      email: user?.email || '',
      // Never a made-up number: empty when the account has none
      phone: stripKuwaitPrefix(user?.phone) || '',
      hqLocation: officeData?.hqLocation || 'السالمية',
      about:
        officeData?.about ||
        'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
      // مواعيد العمل as JSON text (WorkingDay[]); '' when not set. It used
      // to be typed into `services`, overwriting the office's services text
      workingHours: officeData?.workingHours
        ? JSON.stringify(officeData.workingHours)
        : '',
      licenseActivity:
        officeData?.licenseActivity || 'تشطيبات،بناء،ديكور،كهرباء',
      licenseNumber: officeData?.licenseNumber || '6743963845',
      licenseExpiry: officeData?.licenseExpiry || '15 ابريل 2027',
    }),
    [officeData, displayName, user]
  );

  // Form states
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [hqLocation, setHqLocation] = useState(initialValues.hqLocation);
  const [about, setAbout] = useState(initialValues.about);
  const [workingHours, setWorkingHours] = useState(initialValues.workingHours);
  const [licenseActivity, setLicenseActivity] = useState(
    initialValues.licenseActivity
  );
  const [licenseNumber, setLicenseNumber] = useState(
    initialValues.licenseNumber
  );
  const [licenseExpiry, setLicenseExpiry] = useState(
    initialValues.licenseExpiry
  );

  // File states
  const [logoFile, setLogoFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [licenseFile, setLicenseFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Modals & submission state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine dirty state (modified)
  const isDirty = useMemo(() => {
    return (
      name !== initialValues.name ||
      email !== initialValues.email ||
      phone !== initialValues.phone ||
      hqLocation !== initialValues.hqLocation ||
      about !== initialValues.about ||
      workingHours !== initialValues.workingHours ||
      licenseActivity !== initialValues.licenseActivity ||
      licenseNumber !== initialValues.licenseNumber ||
      licenseExpiry !== initialValues.licenseExpiry ||
      logoFile !== null ||
      licenseFile !== null
    );
  }, [
    name,
    email,
    phone,
    hqLocation,
    about,
    workingHours,
    licenseActivity,
    licenseNumber,
    licenseExpiry,
    logoFile,
    licenseFile,
    initialValues,
  ]);

  // Document Pickers
  const pickLogo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLogoFile(result.assets[0]);
    }
  };

  const pickLicense = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLicenseFile(result.assets[0]);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toLocaleDateString('ar-KW-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setLicenseExpiry(formattedDate);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!isDirty || isSubmitting) return;

    if (!name.trim()) {
      showAlert('تنبيه', 'يرجى إدخال اسم المكتب');
      return;
    }
    // Always required: it's how people reach the office
    if (phone.replace(/\D/g, '').slice(-8).length !== 8) {
      showAlert('تنبيه', 'رقم الهاتف مطلوب للتواصل معك.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formatKuwaitPhone = (val?: string | null) => {
        if (!val) return '';
        const cleaned = val.trim();
        if (!cleaned) return '';
        if (cleaned.startsWith('+')) return cleaned;
        if (cleaned.startsWith('965')) return `+${cleaned}`;
        return `+965${cleaned}`;
      };

      // 1. The account's fields. Office fields go to the identity below:
      //    /users/profile rejects the licence ones (unknown properties)
      await apiClient.patch('/users/profile', {
        name,
        email,
        phone: formatKuwaitPhone(phone),
        // No WhatsApp: offices are reached by phone or in-app chat
      });

      // 2. The office's own fields, with any picked files
      const formData = new FormData();
      formData.append('name', name);
      formData.append('licenseNumber', licenseNumber);
      formData.append('hqLocation', hqLocation);
      formData.append('about', about);
      formData.append('licenseActivity', licenseActivity);
      formData.append('licenseExpiry', licenseExpiry);
      if (workingHours) formData.append('workingHours', workingHours);

      if (logoFile) {
        formData.append('logo', {
          uri: logoFile.uri,
          name: logoFile.name || 'logo.jpg',
          type: logoFile.mimeType || 'image/jpeg',
        } as any);
      }

      if (licenseFile) {
        formData.append('license', {
          uri: licenseFile.uri,
          name: licenseFile.name || 'license.jpg',
          type: licenseFile.mimeType || 'image/jpeg',
        } as any);
      }

      await apiClient.patch(
        `/identities/${activeIdentity?.id || ''}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      await refreshProfile();
      showAlert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Update office profile error:', error);
      const msg =
        error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات';
      showAlert('خطأ', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* 1. Header */}
        <OfficeEditProfileHeader onBack={() => router.back()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        >
          {/* 2. Logo Upload */}
          <OfficeLogoUpload
            avatarUri={logoFile?.uri || avatarUrl}
            onPickLogo={pickLogo}
          />

          {/* 3. Section 1: عن المكتب */}
          <OfficeGeneralInfoSection
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            hqLocation={hqLocation}
            setHqLocation={setHqLocation}
            about={about}
            setAbout={setAbout}
            workingHours={workingHours}
            setWorkingHours={setWorkingHours}
          />

          {/* 4. Section 2: رخصة المكتب */}
          <OfficeLicenseSection
            licenseActivity={licenseActivity}
            onOpenActivityModal={() => setActivityModalVisible(true)}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
            licenseExpiry={licenseExpiry}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            onDateChange={handleDateChange}
            licenseFile={licenseFile}
            existingLicenseUrl={officeData?.licenseFileUrl}
            onPickLicense={pickLicense}
          />
        </ScrollView>

        {/* 5. Bottom Action Button */}
        <OfficeSaveButton
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onPress={handleSubmit}
        />

        {/* Modals */}
        <SelectionModal
          visible={activityModalVisible}
          title="اختر النشاط"
          options={KUWAIT_ACTIVITIES}
          selectedValue={licenseActivity}
          onSelect={setLicenseActivity}
          onClose={() => setActivityModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
