import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { companyService } from '@/shared/api/company.service';
import {
  ALL_TYPES,
  listedTypes,
  OTHER_TYPE,
  typesToSend,
} from '@/shared/data/serviceCatalog';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

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
  // Types already added can't be added again; "اخرى" can, under a new title
  const takenTypes = myServices.services
    .map((item) => item.type)
    .filter((type) => type !== OTHER_TYPE);

  const [pickedSpecialty, setPickedSpecialty] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openField, setOpenField] = useState<OpenField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const specialty = lockedSpecialty ?? pickedSpecialty;
  const typeOptions = specialty
    ? [ALL_TYPES, ...listedTypes(specialty), OTHER_TYPE]
    : [];
  // The listed types still free to add
  const freeTypes = listedTypes(specialty).filter(
    (type) => !takenTypes.includes(type),
  );
  // The rows shown ticked and greyed: the taken types, and "الكل" once
  // nothing it stands for is left (every listed type, or, for a specialty
  // with no list, the specialty itself)
  const allTaken =
    listedTypes(specialty).length > 0
      ? freeTypes.length === 0
      : !!specialty && takenTypes.includes(specialty);
  const disabledTypes = [...takenTypes, ...(allTaken ? [ALL_TYPES] : [])];
  const hasOther = selectedTypes.includes(OTHER_TYPE);
  const types = typesToSend(specialty, selectedTypes);

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

  const toggleType = (type: string) => {
    if (disabledTypes.includes(type)) return;
    setSelectedTypes((current) => {
      if (type === ALL_TYPES) {
        const others = current.filter((item) => item === OTHER_TYPE);
        return current.includes(ALL_TYPES)
          ? others
          : [ALL_TYPES, ...freeTypes, ...others];
      }
      const next = current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type];
      if (type === OTHER_TYPE) return next;
      // "الكل" follows the free listed types: on only while all of them are
      const allFree =
        freeTypes.length > 0 && freeTypes.every((item) => next.includes(item));
      const withoutAll = next.filter((item) => item !== ALL_TYPES);
      return allFree ? [ALL_TYPES, ...withoutAll] : withoutAll;
    });
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

  // What the closed نوع الخدمة field reads
  const typesLabel = selectedTypes.includes(ALL_TYPES)
    ? [ALL_TYPES, ...(hasOther ? [OTHER_TYPE] : [])].join('، ')
    : selectedTypes.join('، ');

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
      queryClient.invalidateQueries({ queryKey: ['companyServices'] });
      setIsSubmitting(false);
      setOpenField(null);
      successSheetRef.current?.present();
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
    setSelectedTypes([]);
    setServiceTitle('');
    setDescription('');
    setOpenField(null);
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
    // Success sheet actions
    successSheetRef,
    viewService,
    addAnother,
  };
}
