import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { COMPANY_CATEGORY_OPTIONS } from '@/shared/components/CategoryFilterSheet';
import { showAlert } from '@/shared/utils/alert';

export const SPECIALTY_OPTIONS = COMPANY_CATEGORY_OPTIONS.filter(
  (option) => option.id !== 'all',
);

export const REQUEST_TYPE_OPTIONS = [
  { id: 'quote', label: 'عرض سعر' },
  { id: 'consultation', label: 'استشارة' },
  { id: 'site_visit', label: 'معاينة موقع' },
  { id: 'full_project', label: 'تنفيذ مشروع كامل' },
];

export const MAX_ATTACHMENTS = 10;

export interface AddressCoords {
  lat: number;
  lng: number;
}

export function useRequestQuoteForm() {
  const [specialtyId, setSpecialtyId] = useState('');
  const [requestTypeId, setRequestTypeId] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [addressCoords, setAddressCoords] = useState<AddressCoords | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleConfirmAddress = useCallback(
    (addressName: string, lat: number, lng: number) => {
      setAddressLabel(addressName);
      setAddressCoords({ lat, lng });
      setShowMapPicker(false);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      if (!specialtyId) {
        showAlert('تنبيه', 'يرجى اختيار مجال التخصص');
        return;
      }
      if (!addressLabel) {
        showAlert('تنبيه', 'يرجى تحديد العنوان على الخريطة');
        return;
      }

      const specialtyLabel =
        SPECIALTY_OPTIONS.find((option) => option.id === specialtyId)?.label ||
        specialtyId;
      const requestTypeLabel =
        REQUEST_TYPE_OPTIONS.find((option) => option.id === requestTypeId)
          ?.label || undefined;

      try {
        setIsSubmitting(true);
        await companyRequestsService.create({
          title: specialtyLabel,
          category: specialtyLabel,
          offerType: requestTypeLabel,
          priceRange:
            priceFrom || priceTo
              ? `${priceFrom || 0} - ${priceTo || 0} د.ك`
              : undefined,
          location: addressLabel,
          latitude: addressCoords?.lat,
          longitude: addressCoords?.lng,
          description,
          images: attachments,
        });
        onSuccess?.();
      } catch (error: any) {
        const backendMessage = error?.response?.data?.message;
        const message = Array.isArray(backendMessage)
          ? backendMessage.join('\n')
          : backendMessage || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً';
        showAlert('خطأ', message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      specialtyId,
      addressLabel,
      requestTypeId,
      priceFrom,
      priceTo,
      addressCoords?.lat,
      addressCoords?.lng,
      description,
      attachments,
    ],
  );

  return {
    specialtyId,
    setSpecialtyId,
    requestTypeId,
    setRequestTypeId,
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    addressLabel,
    setAddressLabel,
    addressCoords,
    setAddressCoords,
    showMapPicker,
    setShowMapPicker,
    description,
    setDescription,
    attachments,
    setAttachments,
    isSubmitting,
    handlePickAttachments,
    removeAttachment,
    handleConfirmAddress,
    handleSubmit,
  };
}
