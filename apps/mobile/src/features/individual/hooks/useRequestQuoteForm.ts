import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef, useState } from 'react';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useGovArea } from '@/shared/components/forms/GovAreaFields';
import { requestTypeOptions } from '@/shared/data/serviceCatalog';
import { showAlert } from '@/shared/utils/alert';

// مجال التخصص and نوع الطلب come from the services catalogue, the same list
// companies pick their services from, so a request lands with the
// companies of that specialty
export {
  requestTypeOptions,
  SPECIALTY_OPTIONS,
} from '@/shared/data/serviceCatalog';

export const MAX_ATTACHMENTS = 10;

export function useRequestQuoteForm() {
  const [specialtyId, setSpecialtyIdState] = useState('');
  const [requestTypeId, setRequestTypeId] = useState('');
  // Another specialty has another list of request types
  const setSpecialtyId = useCallback((value: string) => {
    setSpecialtyIdState(value);
    setRequestTypeId('');
  }, []);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  // Where: the governorate and an area of it (no map pin)
  const govArea = useGovArea();
  const resetGovArea = govArea.reset;
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State updates land after the tap, so a quick second tap would still pass
  // the isSubmitting check; the ref blocks it at once
  const submittingRef = useRef(false);

  // Back to the empty form (after a request is sent)
  const reset = useCallback(() => {
    setSpecialtyIdState('');
    setRequestTypeId('');
    setPriceFrom('');
    setPriceTo('');
    resetGovArea();
    setDescription('');
    setAttachments([]);
  }, [resetGovArea]);

  const handlePickAttachments = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'إذن مطلوب',
          'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!',
          [{ text: 'حسناً' }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_ATTACHMENTS - attachments.length,
      });

      if (!result.canceled && result.assets) {
        setAttachments((prev) => [
          ...prev,
          ...result.assets.map((asset) => asset.uri),
        ]);
      }
    } catch (error) {
      console.error('Attachment picker error:', error);
      showAlert('خطأ', 'حدث خطأ أثناء اختيار الصور. حاول مرة أخرى.', [
        { text: 'حسناً' },
      ]);
    }
  }, [attachments.length]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      if (submittingRef.current) return;
      if (!specialtyId) {
        showAlert('تنبيه', 'يرجى اختيار مجال التخصص');
        return;
      }
      if (!govArea.isComplete) {
        showAlert('تنبيه', 'يرجى اختيار المحافظة والمنطقة');
        return;
      }
      if (!description.trim()) {
        showAlert('تنبيه', 'يرجى كتابة وصف الطلب');
        return;
      }

      try {
        submittingRef.current = true;
        setIsSubmitting(true);
        await companyRequestsService.create({
          // The request type names it; the specialty decides which
          // companies see it
          title: requestTypeId || specialtyId,
          category: specialtyId,
          priceRange:
            priceFrom || priceTo
              ? `${priceFrom || 0} - ${priceTo || 0} د.ك`
              : undefined,
          location: govArea.locationLabel,
          description,
          images: attachments,
        });
        // Empty form: the same request can't be sent twice
        reset();
        onSuccess?.();
      } catch (error: any) {
        const backendMessage = error?.response?.data?.message;
        const message = Array.isArray(backendMessage)
          ? backendMessage.join('\n')
          : backendMessage || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً';
        showAlert('خطأ', message);
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      reset,
      specialtyId,
      govArea.isComplete,
      govArea.locationLabel,
      requestTypeId,
      priceFrom,
      priceTo,
      description,
      attachments,
    ],
  );

  return {
    specialtyId,
    setSpecialtyId,
    requestTypeId,
    setRequestTypeId,
    requestTypeOptions: requestTypeOptions(specialtyId),
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    govArea,
    description,
    setDescription,
    attachments,
    setAttachments,
    isSubmitting,
    handlePickAttachments,
    removeAttachment,
    handleSubmit,
    reset,
  };
}
