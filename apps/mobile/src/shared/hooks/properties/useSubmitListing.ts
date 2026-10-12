import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { plansService, PublishOption } from '@/shared/api/plans.service';
import { propertiesService } from '@/shared/api/properties.service';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

/**
 * Encapsulates the submit/publish/draft flow for the Add Ad preview screen:
 * quota checks, image upload, property creation, and the resulting
 * success/quota/slot-picker sheet state.
 */
export function useSubmitListing() {
  const router = useRouter();
  const activeIdentity = useAuthStore((state) => state.activeIdentity);

  const slotPickerRef = useRef<BottomSheetModal>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);
  const [publishOptions, setPublishOptions] = useState<PublishOption[]>([]);
  const [quotaSheetMode, setQuotaSheetMode] = useState<
    'exhausted' | 'featuredUnavailable'
  >('exhausted');

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
    ensureSubmissionKey,
    clearSubmissionKey,
  } = useListingStore();

  // One publish at a time: a second tap while the first is still checking
  // the balance or uploading would spend the package twice
  const publishingRef = useRef(false);

  const submitListing = async (
    isDraft: boolean,
    planSlotId?: string,
  ): Promise<{
    success: boolean;
    error?: string;
    // Server error code, e.g. PACKAGE_UNUSABLE
    code?: string;
    propertyId?: string;
  }> => {
    try {
      setSubmitting(true);
      setSubmissionError(null);
      // Same key on every retry of this publish (see useListingStore)
      if (!isDraft) ensureSubmissionKey();

      let uploadedUrls: string[] = [];
      if (draftData.images.length > 0) {
        uploadedUrls = await propertiesService.uploadImages(draftData.images);
      }

      const payload = buildApiPayload(isDraft, uploadedUrls, planSlotId);
      const res = await propertiesService.createProperty(payload);
      if (!isDraft) clearSubmissionKey();

      return { success: true, propertyId: res.property.id };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

      const axiosError = error as {
        response?: { data?: { message?: string | string[]; code?: string } };
      };
      const backendMessage = axiosError?.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : backendMessage || errorMessage;

      setSubmissionError(displayMessage);
      return {
        success: false,
        error: displayMessage,
        code: axiosError?.response?.data?.code,
      };
    } finally {
      setSubmitting(false);
    }
  };

  // The packages the user can publish from right now, or null (with the
  // matching sheet shown) when there are none for this ad
  const loadEligibleOptions = async (): Promise<PublishOption[] | null> => {
    const optionsRes = await plansService.getPublishOptions();

    if (!optionsRes.canPublish || optionsRes.options.length === 0) {
      setQuotaSheetMode('exhausted');
      quotaSheetRef.current?.present();
      return null;
    }

    const wantsFeatured = draftData.adLevel === 'premium';
    const eligibleOptions = wantsFeatured
      ? optionsRes.options.filter((option) => option.featuredDays > 0)
      : optionsRes.options;

    if (eligibleOptions.length === 0) {
      setQuotaSheetMode('featuredUnavailable');
      quotaSheetRef.current?.present();
      return null;
    }
    return eligibleOptions;
  };

  // Publishes from one package; if the server refuses that package (used up
  // meanwhile, or another persona's), offers what's left instead of leaving
  // the user at a dead-end error
  const publishFrom = async (slotId: string) => {
    const res = await submitListing(false, slotId);
    if (res.success) {
      setCreatedPropertyId(res.propertyId ?? null);
      setShowSuccess(true);
      return;
    }
    if (res.code !== 'PACKAGE_UNUSABLE') {
      showAlert('خطأ', res.error || 'فشل في إضافة الإعلان');
      return;
    }

    const remaining = await loadEligibleOptions();
    if (!remaining) return;
    showAlert('تعذر النشر من هذه الباقة', res.error || '', [
      {
        text: 'اختيار باقة أخرى',
        onPress: () => {
          setPublishOptions(remaining);
          slotPickerRef.current?.present();
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (publishingRef.current) return;
    publishingRef.current = true;
    setSubmitting(true);
    try {
      const eligibleOptions = await loadEligibleOptions();
      if (!eligibleOptions) return;

      if (eligibleOptions.length === 1) {
        await publishFrom(eligibleOptions[0].slotId);
        return;
      }

      setPublishOptions(eligibleOptions);
      slotPickerRef.current?.present();
    } catch (e) {
      console.error('Failed to check publish options:', e);
      showAlert('خطأ', 'فشل في التحقق من رصيد الإعلانات');
    } finally {
      setSubmitting(false);
      publishingRef.current = false;
    }
  };

  const handleSlotSelected = async (slotId: string) => {
    if (publishingRef.current) return;
    publishingRef.current = true;
    slotPickerRef.current?.dismiss();
    try {
      await publishFrom(slotId);
    } catch (e) {
      console.error('Failed to publish:', e);
      showAlert('خطأ', 'فشل في إضافة الإعلان');
    } finally {
      publishingRef.current = false;
    }
  };

  const handleSaveDraft = async () => {
    const res = await submitListing(true);
    if (res.success && activeIdentity?.type === 'INDIVIDUAL') {
      // Lands on نشاطي -> مسودة, which confirms with its toast
      resetForm();
      router.replace({ pathname: '/activity', params: { draftSaved: 'true' } });
    } else if (res.success) {
      showAlert('تم الحفظ', 'تم حفظ الإعلان كمسودة بنجاح', [
        {
          text: 'حسناً',
          onPress: () => {
            resetForm();
            router.replace(getIdentityHomeRoute(activeIdentity?.type));
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
    quotaSheetMode,
    showSuccess,
    setShowSuccess,
    createdPropertyId,
    handleSubmit,
    handleSlotSelected,
    handleSaveDraft,
  };
}
