import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  normalizeEmail,
  useEmailVerification,
} from '@/features/individual/components/more/email-verification/useEmailVerification';
import {
  localPhone,
  usePhoneVerification,
} from '@/features/individual/components/more/phone-verification/usePhoneVerification';
import { settingsService } from '@/shared/api/settings.service';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import { EMAIL_PATTERN } from './EmailField';
import type { ProfileFormData } from './types';

export interface ProfileToast {
  kind: 'success' | 'warning';
  message: string;
}

export const EMAIL_VERIFY_FIRST_MESSAGE =
  'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.';
export const EMAIL_VERIFIED_MESSAGE = 'تم التحقق من البريد الالكتروني بنجاح.';
const TOAST_MS = 3000;

/**
 * Edit Profile's form and saving. A changed phone or email is a new sign-in
 * identifier: a phone is proven by SMS when saving (the rest of the form is
 * saved once the code checks out); an email is proven with an emailed code
 * from the "ارسال رمز التحقق" link before saving. The email is optional, so
 * an account made with a phone number saves without one.
 */
export function useEditProfile() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeIdentity, displayName, avatarUrl } = useIdentity();

  const derivedName =
    activeIdentity?.individualData?.name ||
    displayName ||
    (user?.email ? user.email.split('@')[0] : 'غير معروف');

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: derivedName,
      email: user?.email || '',
      phone: user?.phone || '',
      whatsapp: activeIdentity?.individualData?.whatsapp || user?.phone || '',
      avatarUrl: avatarUrl || 'https://via.placeholder.com/150',
    },
    mode: 'onChange', // Validates on every keystroke to update button state
  });

  const [toast, setToast] = useState<ProfileToast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (next: ProfileToast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const saveProfile = async (data: ProfileFormData) => {
    try {
      const email = data.email.trim();
      await settingsService.updateProfile({
        name: data.name,
        // Left out when empty: a phone-only account has no email to send
        email: email || undefined,
        phone: data.phone,
        whatsapp: data.whatsapp,
        avatarUrl: data.avatarUrl,
      });
      await useAuthStore.getState().refreshProfile();
      showAlert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Update profile error:', error);
      showAlert(
        'خطأ',
        error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات',
      );
    }
  };

  // Whether the phone on file is SMS-verified (null while loading); an
  // unverified one gets a "تحقق من الرقم" link under the field
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  useEffect(() => {
    settingsService
      .getLoginMethod()
      .then((m) => setPhoneVerified(m.phoneVerified))
      .catch(() => setPhoneVerified(null));
  }, []);

  // The rest of the form waits here while a new phone is being verified
  const pendingSave = useRef<ProfileFormData | null>(null);
  const phoneCheck = usePhoneVerification(async () => {
    setPhoneVerified(true);
    await useAuthStore.getState().refreshProfile();
    const pending = pendingSave.current;
    pendingSave.current = null;
    if (pending) {
      await saveProfile(pending);
    } else {
      showAlert('نجاح', 'تم التحقق من رقم الهاتف');
    }
  });

  // The address whose code was just checked (it's now on the account)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const emailCheck = useEmailVerification(async (email) => {
    setVerifiedEmail(normalizeEmail(email));
    showToast({ kind: 'success', message: EMAIL_VERIFIED_MESSAGE });
    await useAuthStore.getState().refreshProfile();
  });

  const isEmailUnverified = (value: string) => {
    const email = normalizeEmail(value);
    return (
      email !== '' &&
      email !== normalizeEmail(user?.email) &&
      email !== verifiedEmail
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (isEmailUnverified(data.email)) {
      showToast({ kind: 'warning', message: EMAIL_VERIFY_FIRST_MESSAGE });
      return;
    }
    if (localPhone(data.phone) !== localPhone(user?.phone)) {
      pendingSave.current = data;
      if (!(await phoneCheck.start(data.phone))) pendingSave.current = null;
      return;
    }
    await saveProfile(data);
  };

  // Read both every render: formState is a proxy that only tracks what is
  // read, and `isDirty && isValid` would skip isValid while clean
  const { isDirty, isValid } = form.formState;

  const phoneChanged =
    localPhone(form.watch('phone')) !== localPhone(user?.phone);

  const emailValue = form.watch('email') ?? '';
  const emailNeedsCode =
    isEmailUnverified(emailValue) && EMAIL_PATTERN.test(emailValue.trim());

  return {
    form,
    submit: form.handleSubmit(onSubmit),
    canSubmit: isDirty && isValid,
    savedPhone: user?.phone ?? null,
    phoneChanged,
    // Only for a phone already on file that isn't verified
    needsPhoneVerification:
      !phoneChanged && !!user?.phone && phoneVerified === false,
    verifySavedPhone: () => {
      if (user?.phone) void phoneCheck.start(user.phone);
    },
    phoneCheck,
    // A new, valid address that still needs its code
    emailNeedsCode,
    sendEmailCode: () => {
      void emailCheck.start(emailValue.trim());
    },
    emailCheck,
    toast,
    goBack: () => router.back(),
  };
}
