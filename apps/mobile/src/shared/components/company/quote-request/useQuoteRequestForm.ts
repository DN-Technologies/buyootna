import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';

import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useGovArea } from '@/shared/components/forms/GovAreaFields';
import {
  OTHER_TYPE,
  requestTypeOptions,
  SPECIALTY_OPTIONS,
  specialtyOfType,
} from '@/shared/data/serviceCatalog';
import { showAlert } from '@/shared/utils/alert';

export interface ServiceItem {
  id: string;
  title: string;
}

const MAX_ATTACHMENTS = 10;

interface Options {
  companyName: string;
  // The company's / office's own services (their request types)
  services: ServiceItem[];
  // A company with no services yet: pick from the services catalogue
  // (مجال التخصص, then نوع الطلب) as in طلب عرض سعر
  catalogFallback?: boolean;
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
  catalogFallback = false,
  targetIdentityId,
  onSent,
}: Options) {
  const [serviceId, setServiceId] = useState('');
  const [specialtyId, setSpecialtyIdState] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  // Where: the governorate and an area of it (no map pin)
  const govArea = useGovArea();
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Blocks a quick second tap before isSubmitting has re-rendered
  const submittingRef = useRef(false);

  const usesCatalog = catalogFallback && services.length === 0;
  // The company's own request types; from the catalogue when it has none;
  // an office with none can still ask, as «اخرى»
  const serviceOptions = usesCatalog
    ? requestTypeOptions(specialtyId)
    : services.length
      ? services.map((svc) => ({ id: svc.id, label: svc.title }))
      : [{ id: OTHER_TYPE, label: OTHER_TYPE }];

  // Another specialty has another list of request types
  const setSpecialtyId = (id: string) => {
    setSpecialtyIdState(id);
    setServiceId('');
  };

  const reset = () => {
    setServiceId('');
    setSpecialtyIdState('');
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
    if (usesCatalog ? !specialtyId : !serviceId) {
      showAlert(
        'تنبيه',
        usesCatalog ? 'يرجى اختيار مجال التخصص' : 'يرجى اختيار نوع الطلب',
      );
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

    // Sent like طلب عرض سعر: the request type names it, the specialty is
    // its category (looked up in the catalogue for the company's own types)
    const type = usesCatalog
      ? serviceId
      : services.find((svc) => svc.id === serviceId)?.title || serviceId;
    const specialty = usesCatalog ? specialtyId : specialtyOfType(type);
    const title = type || specialty || '';
    const category = specialty || title;

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      await companyRequestsService.create({
        title,
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
    usesCatalog,
    specialtyOptions: SPECIALTY_OPTIONS,
    specialtyId,
    setSpecialtyId,
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
