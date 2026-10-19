import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useGovArea } from '@/shared/components/forms/GovAreaFields';
import { showAlert } from '@/shared/utils/alert';

export interface ServiceItem {
  id: string;
  title: string;
}

const MAX_ATTACHMENTS = 10;

interface Options {
  companyName: string;
  services: ServiceItem[];
  targetIdentityId?: string;
  // Called after a successful send (the sheet closes itself)
  onSent: () => void;
}

/**
 * The quote popup's form: service, price range, the governorate and area,
 * description and photos, then sending the request to this company.
 */
export function useQuoteRequestForm({
  companyName,
  services,
  targetIdentityId,
  onSent,
}: Options) {
  const [serviceId, setServiceId] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  // Where: the governorate and an area of it (no map pin)
  const govArea = useGovArea();
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Blocks a quick second tap before isSubmitting has re-rendered
  const submittingRef = useRef(false);

  const serviceOptions = services.map((svc) => ({
    id: svc.id,
    label: svc.title,
  }));

  const reset = () => {
    setServiceId('');
    setPriceFrom('');
    setPriceTo('');
    govArea.reset();
    setDescription('');
    setAttachments([]);
  };

  const pickAttachments = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك!', [
          { text: 'حسناً' },
        ]);
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
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!serviceId) {
      showAlert('تنبيه', 'يرجى اختيار نوع الطلب');
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

    // The options come from the company's own services; their titles are
    // the human-readable category
    const category =
      services.find((svc) => svc.id === serviceId)?.title || serviceId;

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      await companyRequestsService.create({
        title: category,
        category,
        priceRange:
          priceFrom || priceTo
            ? `${priceFrom || 0} - ${priceTo || 0} د.ك`
            : undefined,
        offerType: 'عرض مخصص',
        location: govArea.locationLabel,
        description,
        images: attachments,
        targetIdentityId,
      });
      showAlert('تم بنجاح', `تم إرسال طلب عرض السعر إلى ${companyName} بنجاح!`);
      reset();
      onSent();
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
  };

  return {
    serviceOptions,
    serviceId,
    setServiceId,
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    govArea,
    description,
    setDescription,
    attachments,
    pickAttachments,
    removeAttachment,
    isSubmitting,
    submit,
    reset,
  };
}
