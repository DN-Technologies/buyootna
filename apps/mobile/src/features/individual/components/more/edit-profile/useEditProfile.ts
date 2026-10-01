import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  localPhone,
  usePhoneVerification,
} from '@/features/individual/components/more/phone-verification/usePhoneVerification';
import { settingsService } from '@/shared/api/settings.service';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import type { ProfileFormData } from './types';

/**
 * Edit Profile's form and saving. A changed phone is a new sign-in
 * identifier, so it is proven by SMS first and the rest of the form is
 * saved once the code checks out.
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

  const saveProfile = async (data: ProfileFormData) => {
    try {
      await settingsService.updateProfile({
        name: data.name,
        email: data.email,
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

  const onSubmit = async (data: ProfileFormData) => {
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
    goBack: () => router.back(),
  };
}
