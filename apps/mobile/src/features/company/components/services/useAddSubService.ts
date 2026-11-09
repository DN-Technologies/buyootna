import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { useServiceTypeSelection } from '@/features/company/components/add-service/useServiceTypeSelection';
import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { companyService, type MyCompanyService } from '@/shared/api/company.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { dismissSheet, presentSheet } from '@/shared/utils/presentSheet';

import { useServicesActions } from './useServicesActions';

/**
 * اضافة خدمة فرعية (Figma 8455:24674 / 8455:25340): types of the company's
 * specialty not yet added, and a title when "اخرى" is picked. Adding is the
 * same as إضافة خدمة's, under the locked specialty.
 */
export function useAddSubService(specialty: string, existing: MyCompanyService[]) {
  const router = useRouter();
  const { refresh } = useServicesActions();
  const selection = useServiceTypeSelection(specialty, existing);
  const [serviceTitle, setServiceTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const pickerRef = useRef<BottomSheetModal>(null);

  const isValid =
    selection.types.length > 0 &&
    (!selection.hasOther || serviceTitle.trim().length > 0);

  const reset = () => {
    selection.setSelectedTypes([]);
    setServiceTitle('');
  };

  const open = () => {
    reset();
    presentSheet(sheetRef);
  };

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await companyService.createService({
        specialty,
        types: selection.types,
        title: selection.hasOther ? serviceTitle.trim() : undefined,
      });
      await refresh();
      // Only what's open: the picker isn't, when adding from the sheet
      dismissSheet(pickerRef);
      dismissSheet(sheetRef);
      reset();
    } catch (error) {
      if (handleSubscriptionRequired(error, router)) return;
      showAlert(
        'فشل إضافة الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // The picker's «اضافة»: adds at once, unless «اخرى» still needs its
  // title (back to the sheet)
  const addFromPicker = () => {
    if (selection.hasOther) {
      dismissSheet(pickerRef);
      return;
    }
    void submit();
  };

  return {
    ...selection,
    addFromPicker,
    serviceTitle,
    setServiceTitle,
    isValid,
    isSubmitting,
    submit,
    open,
    sheetRef,
    pickerRef,
  };
}

export type AddSubService = ReturnType<typeof useAddSubService>;
