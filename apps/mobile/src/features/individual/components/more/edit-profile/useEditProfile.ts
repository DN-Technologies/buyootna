import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  type LoginMethod,
  settingsService,
} from '@/shared/api/settings.service';
import { EMAIL_PATTERN } from '@/shared/components/forms/EmailField';
import type { ProfileFormData } from '@/shared/components/forms/types';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import {
  normalizeEmail,
  useEmailVerification,
} from '@/shared/hooks/verification/useEmailVerification';
import {
  localPhone,
  usePhoneVerification,
} from '@/shared/hooks/verification/usePhoneVerification';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { emailForSave } from '@/shared/utils/profileEmail';

export interface ProfileToast {
  kind: 'success' | 'warning';
  message: string;
}

export const EMAIL_VERIFY_FIRST_MESSAGE =
  'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.';
export const EMAIL_VERIFIED_MESSAGE = 'تم التحقق من البريد الالكتروني بنجاح.';
export const EMAIL_REQUIRED_MESSAGE =
  'البريد الإلكتروني مطلوب حسب طريقة تسجيل الدخول لديك.';
export const PHONE_REQUIRED_MESSAGE =
  'رقم الهاتف مطلوب للتواصل معك.';
const TOAST_MS = 3000;

/**
 * Edit Profile's form and saving. A changed phone or email is a new sign-in
 * identifier: a phone is proven by SMS when saving (the rest of the form is
 * saved once the code checks out); an email is proven with an emailed code
 * from the "ارسال رمز التحقق" link before saving. Which of the two is
 * required follows the sign-in method (طريقة تسجيل الدخول): PHONE needs the
 * phone, EMAIL the email, BOTH both.
 */
export function useEditProfile() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeIdentity, displayName, avatarUrl } = useIdentity();

  const derivedName =
    activeIdentity?.individualData?.name ||
    displayName ||
    (user?.email ? user.email.split('@')[0] : 'غير معروف');

  // What's saved on the profile -- the form starts from it every time
  const savedValues = (): ProfileFormData => ({
    name: derivedName,
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: activeIdentity?.individualData?.whatsapp || user?.phone || '',
    avatarUrl: avatarUrl || 'https://via.placeholder.com/150',
  });

  const form = useForm<ProfileFormData>({
    defaultValues: savedValues(),
    mode: 'onChange', // Validates on every keystroke to update button state
  });

  // The screen can stay mounted after it's closed, which kept unsaved edits
  // (and their errors) for the next visit (QA). Back on screen after leaving
  // it, the form starts again from what's saved
  // (Only on focus changes: a profile refresh mid-edit, e.g. after a code
  // check, must not wipe what's being typed)
  const latestSaved = useRef(savedValues);
  latestSaved.current = savedValues;
  const leftScreen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (leftScreen.current) {
        form.reset(latestSaved.current());
        leftScreen.current = false;
      }
      return () => {
        leftScreen.current = true;
      };
    }, [form]),
  );

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
      await settingsService.updateProfile({
        name: data.name,
        // Cleared: removes the address on file; never had one: left out
        email: emailForSave(data.email, user?.email),
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
  // The sign-in method decides which of email / phone is required; null
  // while loading or if it failed, and then neither is (never blocks saving)
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
  const emailRequired = loginMethod !== null && loginMethod !== 'PHONE';
  // Always: the phone is how people reach you, whatever the sign-in method
  // (which only decides what logs in). QA: an EMAIL account saved with none
  const phoneRequired = true;

  // A new number to verify; a cleared one isn't (the API keeps the number
  // on file -- a sign-in identifier is never blanked)
  const isNewPhone = (value: string) =>
    localPhone(value) !== '' && localPhone(value) !== localPhone(user?.phone);

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
    if (emailRequired && !data.email.trim()) {
      showToast({ kind: 'warning', message: EMAIL_REQUIRED_MESSAGE });
      return;
    }
    if (phoneRequired && !localPhone(data.phone)) {
      showToast({ kind: 'warning', message: PHONE_REQUIRED_MESSAGE });
      return;
    }
    if (isEmailUnverified(data.email)) {
      showToast({ kind: 'warning', message: EMAIL_VERIFY_FIRST_MESSAGE });
      return;
    }
    if (isNewPhone(data.phone)) {
      pendingSave.current = data;
      if (!(await phoneCheck.start(data.phone))) pendingSave.current = null;
      return;
    }
    await saveProfile(data);
  };

  // Read both every render: formState is a proxy that only tracks what is
  // read, and `isDirty && isValid` would skip isValid while clean
  const { isDirty, isValid } = form.formState;

  const phoneChanged = isNewPhone(form.watch('phone') ?? '');

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
    loginMethod,
    emailRequired,
    phoneRequired,
    openSettings: () => router.push('/settings'),
    goBack: () => router.back(),
  };
}
