import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import apiClient from '@/shared/api/api';
import {
  type LoginMethod,
  settingsService,
} from '@/shared/api/settings.service';
import { EMAIL_PATTERN } from '@/shared/components/forms/EmailField';
import type { ProfileFormData } from '@/shared/components/forms/types';
import {
  normalizeEmail,
  useEmailVerification,
} from '@/shared/hooks/useEmailVerification';
import { useIdentity } from '@/shared/hooks/useIdentity';
import {
  localPhone,
  usePhoneVerification,
} from '@/shared/hooks/usePhoneVerification';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

// Minimal shape both expo pickers satisfy (DocumentPicker asset, and the
// ImagePicker asset the logo picker returns)
export interface PickedFile {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
}

// The company/identity-side fields. They live outside the RHF form because
// they are identity data (saved to PATCH /identities/:id), not user data.
export interface CompanyIdentityFields {
  hqLocation: string;
  serviceAreas: string;
  about: string;
  // Stored in the API's `services` column -- the design's "مواعيد العمل"
  services: string;
  licenseActivity: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export const EMPTY_IDENTITY_FIELDS: CompanyIdentityFields = {
  hqLocation: '',
  serviceAreas: '',
  about: '',
  services: '',
  licenseActivity: '',
  licenseNumber: '',
  licenseExpiry: '',
};

const stripKuwaitPrefix = (val?: string | null) =>
  (val ?? '').replace(/^(?:\+?965)/, '');

const formatKuwaitPhone = (val?: string | null) => {
  const cleaned = (val ?? '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('965')) return `+${cleaned}`;
  return `+965${cleaned}`;
};

/**
 * Company Edit Profile's form and saving. A changed phone or email is a new
 * sign-in identifier: the phone is proven with an SMS code and the email
 * with an emailed code BEFORE anything saves (the same rule the individual
 * edit-profile follows -- the API refuses an unverified change with 400).
 * User fields then go to PATCH /users/profile; company/licence fields (and
 * any picked logo/licence files) go to PATCH /identities/:id as multipart.
 * The licence fields must never go to /users/profile -- that DTO rejects
 * unknown properties with a 400.
 */
export function useCompanyEditProfile() {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const { activeIdentity } = useIdentity();

  const companyData = activeIdentity?.companyData;

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: companyData?.name || '',
      email: user?.email || '',
      phone: stripKuwaitPrefix(user?.phone),
      whatsapp: stripKuwaitPrefix(user?.whatsapp || user?.phone),
      avatarUrl: '',
    },
    mode: 'onChange',
  });

  // --- Identity fields (plain state; saved to /identities/:id) ---
  const initialValues = useMemo<Omit<CompanyIdentityFields, never>>(
    () => ({
      hqLocation: companyData?.hqLocation || '',
      serviceAreas: companyData?.serviceAreas || '',
      about: companyData?.about || '',
      services: companyData?.services || '',
      licenseActivity: companyData?.licenseActivity || '',
      licenseNumber: companyData?.licenseNumber || '',
      licenseExpiry: companyData?.licenseExpiry || '',
    }),
    [companyData],
  );

  const [identity, setIdentity] = useState(initialValues);
  const setIdentityField = <K extends keyof CompanyIdentityFields>(
    key: K,
    value: CompanyIdentityFields[K],
  ) => setIdentity((prev) => ({ ...prev, [key]: value }));

  // --- Files ---
  const [logoFile, setLogoFile] = useState<PickedFile | null>(null);
  const [licenseFile, setLicenseFile] = useState<PickedFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Picker modals & date picker ---
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [serviceAreasModalVisible, setServiceAreasModalVisible] =
    useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setIdentityField(
        'licenseExpiry',
        selectedDate.toLocaleDateString('ar-KW-u-nu-latn', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      );
    }
  };

  // --- Verification state (phone by SMS, email by emailed code) ---
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  useEffect(() => {
    settingsService
      .getLoginMethod()
      .then((m) => {
        setPhoneVerified(m.phoneVerified);
        setLoginMethod(m.loginMethod ?? 'BOTH');
      })
      .catch(() => setPhoneVerified(null));
  }, []);

  const isNewPhone = (value: string) =>
    localPhone(value) !== '' && localPhone(value) !== localPhone(user?.phone);

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const isEmailUnverified = (value: string) => {
    const email = normalizeEmail(value);
    return (
      email !== '' &&
      email !== normalizeEmail(user?.email) &&
      email !== verifiedEmail
    );
  };

  // The rest of the save waits here while a new phone is being verified
  const pendingSave = useRef<ProfileFormData | null>(null);
  const phoneCheck = usePhoneVerification(async () => {
    setPhoneVerified(true);
    await useAuthStore.getState().refreshProfile();
    const pending = pendingSave.current;
    pendingSave.current = null;
    if (pending) {
      await save(pending);
    } else {
      showAlert('نجاح', 'تم التحقق من رقم الهاتف');
    }
  });

  const emailCheck = useEmailVerification(async (email) => {
    setVerifiedEmail(normalizeEmail(email));
    await useAuthStore.getState().refreshProfile();
  });

  // --- Saving ---
  const identityChanged = useMemo(
    () =>
      (Object.keys(initialValues) as (keyof CompanyIdentityFields)[]).some(
        (key) => identity[key] !== initialValues[key],
      ),
    [identity, initialValues],
  );

  const buildIdentityPatch = () => {
    const patch: Partial<Record<keyof CompanyIdentityFields, string>> = {};
    (Object.keys(initialValues) as (keyof CompanyIdentityFields)[]).forEach(
      (key) => {
        if (identity[key] !== initialValues[key]) {
          patch[key] = identity[key];
        }
      },
    );
    return patch;
  };

  const save = async (data: ProfileFormData) => {
    if (!activeIdentity?.id) {
      showAlert('تنبيه', 'لا يمكن حفظ التغييرات حالياً');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. User-side fields. License fields must NOT be sent here --
      //    UpdateProfileDto rejects unknown properties with a 400.
      await settingsService.updateProfile({
        name: data.name,
        email: data.email.trim() || undefined,
        phone: formatKuwaitPhone(data.phone),
        whatsapp: formatKuwaitPhone(data.whatsapp),
      });

      // 2. Company/licence fields + picked files (multipart when files attached)
      const identityPatch = buildIdentityPatch();
      const hasIdentityPatch = Object.keys(identityPatch).length > 0;
      if (hasIdentityPatch || logoFile || licenseFile) {
        const formData = new FormData();
        Object.entries(identityPatch).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, value);
        });
        if (logoFile) {
          formData.append('logo', {
            uri: logoFile.uri,
            name: logoFile.name || 'logo.jpg',
            type: logoFile.mimeType || 'image/jpeg',
          } as unknown as Blob);
        }
        if (licenseFile) {
          formData.append('license', {
            uri: licenseFile.uri,
            name: licenseFile.name || 'license.jpg',
            type: licenseFile.mimeType || 'image/jpeg',
          } as unknown as Blob);
        }
        await apiClient.patch(`/identities/${activeIdentity.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await refreshProfile();
      showAlert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error) {
      showAlert('خطأ', getApiErrorMessage(error, 'حدث خطأ أثناء تحديث البيانات'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!data.name.trim()) {
      showAlert('تنبيه', 'يرجى إدخال اسم الشركة');
      return;
    }
    if (isEmailUnverified(data.email)) {
      showAlert(
        'تنبيه',
        'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.',
      );
      return;
    }
    if (isNewPhone(data.phone)) {
      pendingSave.current = data;
      const opened = await phoneCheck.start(formatKuwaitPhone(data.phone));
      if (!opened) pendingSave.current = null;
      return;
    }
    await save(data);
  };

  const { isDirty } = form.formState;
  const canSubmit =
    (isDirty || identityChanged || !!logoFile || !!licenseFile) &&
    !isSubmitting;

  const phoneChanged = isNewPhone(form.watch('phone') ?? '');
  const emailValue = form.watch('email') ?? '';
  const emailNeedsCode =
    isEmailUnverified(emailValue) && EMAIL_PATTERN.test(emailValue.trim());

  return {
    form,
    submit: form.handleSubmit(onSubmit),
    canSubmit,
    isSubmitting,
    identity,
    setIdentityField,
    initialValues,
    identityChanged,
    logoFile,
    setLogoFile,
    licenseFile,
    setLicenseFile,
    // Verification
    phoneChanged,
    needsPhoneVerification:
      !phoneChanged && !!user?.phone && phoneVerified === false,
    verifySavedPhone: () => {
      if (user?.phone) void phoneCheck.start(user.phone);
    },
    phoneCheck,
    emailNeedsCode,
    sendEmailCode: () => {
      void emailCheck.start(emailValue.trim());
    },
    emailCheck,
    // Pickers
    activityModalVisible,
    setActivityModalVisible,
    serviceAreasModalVisible,
    setServiceAreasModalVisible,
    showDatePicker,
    setShowDatePicker,
    onDateChange,
  };
}
