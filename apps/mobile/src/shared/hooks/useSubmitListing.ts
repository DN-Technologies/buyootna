import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { plansService, PublishOption } from '@/shared/api/plans.service';
import { propertiesService } from '@/shared/api/properties.service';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

/**
 * Encapsulates the submit/publish/draft flow for the Add Ad preview screen:
 * quota checks, image upload, property creation, and the resulting
 * success/quota/slot-picker sheet state.
 */
export function useSubmitListing() {
  const router = useRouter();

  const slotPickerRef = useRef<BottomSheetModal>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);
  const [publishOptions, setPublishOptions] = useState<PublishOption[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    null,
  );

  const draftData = useListingStore();
  const {
    isSubmitting,
    setSubmitting,
    setSubmissionError,
    buildApiPayload,
    resetForm,
  } = useListingStore();

  const submitListing = async (
    isDraft: boolean,
    planSlotId?: string,
  ): Promise<{ success: boolean; error?: string; propertyId?: string }> => {
    try {
      setSubmitting(true);
      setSubmissionError(null);

      let uploadedUrls: string[] = [];
      if (draftData.images.length > 0) {
        uploadedUrls = await propertiesService.uploadImages(draftData.images);
      }

      const payload = buildApiPayload(isDraft, uploadedUrls, planSlotId);
      const res = await propertiesService.createProperty(payload);

      return { success: true, propertyId: res.property.id };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

      const axiosError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const backendMessage = axiosError?.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : backendMessage || errorMessage;

      setSubmissionError(displayMessage);
      return { success: false, error: displayMessage };
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const optionsRes = await plansService.getPublishOptions();

      if (!optionsRes.canPublish || optionsRes.options.length === 0) {
        quotaSheetRef.current?.present();
        return;
      }

      if (optionsRes.options.length === 1) {
        const res = await submitListing(false, optionsRes.options[0].slotId);
        if (res.success) {
          setCreatedPropertyId(res.propertyId ?? null);
          setShowSuccess(true);
        } else {
          showAlert('خطأ', res.error || 'فشل في إضافة الإعلان');
        }
        return;
      }

      setPublishOptions(optionsRes.options);
      slotPickerRef.current?.present();
    } catch (e) {
      console.error('Failed to check publish options:', e);
      showAlert('خطأ', 'فشل في التحقق من رصيد الإعلانات');
    }
  };

  const handleSlotSelected = async (slotId: string) => {
    slotPickerRef.current?.dismiss();
    const res = await submitListing(false, slotId);
    if (res.success) {
      setCreatedPropertyId(res.propertyId ?? null);
      setShowSuccess(true);
    } else {
      showAlert('خطأ', res.error || 'فشل في إضافة الإعلان');
    }
  };

  const handleSaveDraft = async () => {
    const res = await submitListing(true);
    if (res.success) {
      showAlert('تم الحفظ', 'تم حفظ الإعلان كمسودة بنجاح', [
        {
          text: 'حسناً',
          onPress: () => {
            resetForm();
            router.replace('/home');
          },
        },
      ]);
    } else {
      showAlert('خطأ', res.error || 'فشل في حفظ المسودة', [
        { text: 'حسناً' },
      ]);
    }
  };

  return {
    draftData,
    isSubmitting,
    slotPickerRef,
    quotaSheetRef,
    publishOptions,
    showSuccess,
    setShowSuccess,
    createdPropertyId,
    handleSubmit,
    handleSlotSelected,
    handleSaveDraft,
  };
}
