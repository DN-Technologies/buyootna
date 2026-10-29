import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { companyService } from '@/shared/api/company.service';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { useServiceTypeSelection } from './useServiceTypeSelection';

export const DESCRIPTION_MAX_LENGTH = 100;

type OpenField = 'specialty' | 'types' | null;

/**
 * إضافة خدمة's form (Figma 4410:167341): the specialty, the service types
 * picked from its list, a title when "اخرى" is one of them, and an
 * optional description. A company's first service fixes its specialty; the
 * next times (Figma 8455:24216, 8453:24047) the specialty is locked and the
 * types already added show ticked and greyed, out of the choice.
 */
export function useAddService() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeIdentity } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  // What the company already offers. Its specialty is the server's (set by
  // the first service), so the lock holds right after that one without
  // waiting on the profile refresh
  const myServices = useMyCompanyServices();
  const lockedSpecialty =
    myServices.specialty || activeIdentity?.companyData?.specialty || null;
  const [pickedSpecialty, setPickedSpecialty] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openField, setOpenField] = useState<OpenField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialty = lockedSpecialty ?? pickedSpecialty;
  const {
    typeOptions,
    selectedTypes,
    setSelectedTypes,
    disabledTypes,
    toggleType,
    typesLabel,
    hasOther,
    types,
  } = useServiceTypeSelection(specialty, myServices.services);

  const isValid =
    specialty.length > 0 &&
    types.length > 0 &&
    (!hasOther || serviceTitle.trim().length > 0) &&
    description.length <= DESCRIPTION_MAX_LENGTH;

  const selectSpecialty = (value: string) => {
    setPickedSpecialty(value);
    // Another specialty has another list
    setSelectedTypes([]);
    setServiceTitle('');
    setOpenField(null);
  };

  const toggleField = (field: Exclude<OpenField, null>) => {
    if (field === 'specialty' && lockedSpecialty) return;
    if (field === 'types' && !specialty) {
      setOpenField('specialty');
      return;
    }
    // The taken types must be known before anything is picked
    if (field === 'types' && myServices.isLoading) return;
    setOpenField((current) => (current === field ? null : field));
  };

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await companyService.createService({
        specialty,
        types,
        title: hasOther ? serviceTitle.trim() : undefined,
        description: description.trim() || undefined,
      });
      refreshProfile();
      // The services list refetches with the new service
      queryClient.invalidateQueries({ queryKey: ['companyServices'] });
      // Back to where إضافة خدمة was opened from (الخدمات), right away: the
      // screen used to stay put and QA tapped again, adding duplicates. The
      // button stays disabled (isSubmitting) until the screen is gone
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/company-services' as never);
      }
    } catch (error) {
      setIsSubmitting(false);
      if (handleSubscriptionRequired(error, router)) return;
      showAlert(
        'فشل إضافة الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  return {
    // Navigation
    goBack: () => router.back(),
    // Specialty
    specialty,
    isSpecialtyLocked: !!lockedSpecialty,
    selectSpecialty,
    // Service types
    typeOptions,
    selectedTypes,
    disabledTypes,
    typesLabel,
    toggleType,
    hasOther,
    // Which dropdown is open
    openField,
    toggleField,
    // Fields
    serviceTitle,
    setServiceTitle,
    description,
    setDescription,
    // Submit
    isValid,
    isSubmitting,
    submit,
  };
}
