import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';

import { settingsService } from '@/shared/api/settings.service';
import { COMPANY_CATEGORY_OPTIONS } from '@/shared/components/filters/CategoryFilterSheet';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

export const DESCRIPTION_MAX_LENGTH = 100;

const SERVICE_TYPE_OPTIONS = COMPANY_CATEGORY_OPTIONS.filter(
  (option) => option.id !== 'all',
);

/**
 * إضافة خدمة's form state and submission. The service is stored on the
 * company identity's `services` field via the profile endpoint; picking
 * or typing a type filters the dropdown options live.
 */
export function useAddService() {
  const router = useRouter();
  const { activeIdentity } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [serviceType, setServiceType] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const filteredOptions = useMemo(() => {
    const query = serviceType.trim();
    if (!query) return SERVICE_TYPE_OPTIONS;
    return SERVICE_TYPE_OPTIONS.filter((option) =>
      option.label.includes(query),
    );
  }, [serviceType]);

  const isValid =
    serviceType.trim().length > 0 &&
    serviceTitle.trim().length > 0 &&
    description.trim().length > 0 &&
    description.length <= DESCRIPTION_MAX_LENGTH;

  const selectOption = (label: string) => {
    setServiceType(label);
    setIsDropdownOpen(false);
  };

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await settingsService.updateProfile({
        services: serviceType.trim(),
      });
      refreshProfile();
      setIsSubmitting(false);
      successSheetRef.current?.present();
    } catch (error) {
      setIsSubmitting(false);
      showAlert(
        'فشل إضافة الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  const viewService = () => {
    successSheetRef.current?.dismiss();
    if (activeIdentity?.id) {
      router.push(`/company/${activeIdentity.id}` as never);
    } else {
      router.back();
    }
  };

  const addAnother = () => {
    successSheetRef.current?.dismiss();
    setServiceType('');
    setServiceTitle('');
    setDescription('');
    setIsDropdownOpen(false);
  };

  return {
    // Navigation
    goBack: () => router.back(),
    // Fields
    serviceType,
    setServiceType,
    serviceTitle,
    setServiceTitle,
    description,
    setDescription,
    // Type combo
    isDropdownOpen,
    setIsDropdownOpen,
    filteredOptions,
    selectOption,
    // Submit
    isValid,
    isSubmitting,
    submit,
    // Success sheet actions
    successSheetRef,
    viewService,
    addAnother,
  };
}
