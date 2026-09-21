import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/shared/api/api';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
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

export default function CompanyEditProfile() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const { activeIdentity, displayName, avatarUrl } = useIdentity();

  const companyData = activeIdentity?.companyData;

  // Helper to strip Kuwait prefix for display next to +965 pill
  const stripKuwaitPrefix = (val?: string | null) => {
    if (!val) return '';
    return val.replace(/^(?:\+?965)/, '');
  };

  // Initial values
  const initialValues = useMemo(
    () => ({
      name: companyData?.name || displayName || '',
      email: user?.email || '',
      phone: stripKuwaitPrefix(user?.phone),
      whatsapp: stripKuwaitPrefix(user?.whatsapp || user?.phone),
      hqLocation: companyData?.hqLocation || 'السالمية',
      serviceAreas: companyData?.serviceAreas || 'اختر نطاقات الخدمة',
      about:
        companyData?.about ||
        'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
      services: companyData?.services || 'من 9 صباحا حتى 5 مساءا',
      licenseActivity:
        companyData?.licenseActivity || 'تشطيبات،بناء،ديكور،كهرباء',
      licenseNumber: companyData?.licenseNumber || '6743963845',
      licenseExpiry: companyData?.licenseExpiry || '15 ابريل 2027',
    }),
    [companyData, displayName, user]
  );

  // Form states
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [whatsapp, setWhatsapp] = useState(initialValues.whatsapp);
  const [hqLocation, setHqLocation] = useState(initialValues.hqLocation);
  const [serviceAreas, setServiceAreas] = useState(initialValues.serviceAreas);
  const [about, setAbout] = useState(initialValues.about);
  const [services, setServices] = useState(initialValues.services);
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
  const [serviceAreasModalVisible, setServiceAreasModalVisible] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine dirty state (modified)
  const isDirty = useMemo(() => {
    return (
      name !== initialValues.name ||
      email !== initialValues.email ||
      phone !== initialValues.phone ||
      whatsapp !== initialValues.whatsapp ||
      hqLocation !== initialValues.hqLocation ||
      serviceAreas !== initialValues.serviceAreas ||
      about !== initialValues.about ||
      services !== initialValues.services ||
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
    whatsapp,
    hqLocation,
    serviceAreas,
    about,
    services,
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
      const formattedDate = selectedDate.toLocaleDateString('ar-EG', {
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
      showAlert('تنبيه', 'يرجى إدخال اسم الشركة');
      return;
    }

    setIsSubmitting(true);
    try {
      if (logoFile || licenseFile) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('licenseNumber', licenseNumber);
        formData.append('services', services);
        formData.append('hqLocation', hqLocation);
        formData.append('serviceAreas', serviceAreas);
        formData.append('about', about);
        formData.append('licenseActivity', licenseActivity);
        formData.append('licenseExpiry', licenseExpiry);

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
      } else {
        const formatKuwaitPhone = (val?: string | null) => {
          if (!val) return '';
          const cleaned = val.trim();
          if (!cleaned) return '';
          if (cleaned.startsWith('+')) return cleaned;
          if (cleaned.startsWith('965')) return `+${cleaned}`;
          return `+965${cleaned}`;
        };

        await apiClient.patch('/users/profile', {
          name,
          email,
          phone: formatKuwaitPhone(phone),
          whatsapp: formatKuwaitPhone(whatsapp),
          hqLocation,
          serviceAreas,
          about,
          services,
          licenseActivity,
          licenseNumber,
          licenseExpiry,
        });
      }

      await refreshProfile();
      showAlert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Update company profile error:', error);
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
        <CompanyEditProfileHeader onBack={() => router.back()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        >
          {/* 2. Logo Upload */}
          <CompanyLogoUpload
            avatarUri={logoFile?.uri || avatarUrl}
            onPickLogo={pickLogo}
          />

          {/* 3. Section 1: عن الشركة */}
          <CompanyGeneralInfoSection
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            hqLocation={hqLocation}
            setHqLocation={setHqLocation}
            serviceAreas={serviceAreas}
            onOpenServiceAreas={() => setServiceAreasModalVisible(true)}
            about={about}
            setAbout={setAbout}
            services={services}
            setServices={setServices}
          />

          {/* 4. Section 2: الرخصة */}
          <CompanyLicenseSection
            licenseActivity={licenseActivity}
            onOpenActivityModal={() => setActivityModalVisible(true)}
            licenseNumber={licenseNumber}
            setLicenseNumber={setLicenseNumber}
            licenseExpiry={licenseExpiry}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            onDateChange={handleDateChange}
            licenseFile={licenseFile}
            existingLicenseUrl={companyData?.licenseFileUrl}
            onPickLicense={pickLicense}
          />
        </ScrollView>

        {/* 5. Bottom Action Button */}
        <CompanySaveButton
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

        <SelectionModal
          visible={serviceAreasModalVisible}
          title="اختر مناطق تقديم الخدمة"
          options={KUWAIT_AREAS}
          selectedValue={serviceAreas}
          onSelect={setServiceAreas}
          onClose={() => setServiceAreasModalVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
