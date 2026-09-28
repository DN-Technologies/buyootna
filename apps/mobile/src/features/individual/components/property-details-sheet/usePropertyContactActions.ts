import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { openChatWith } from '@/shared/utils/openChat';
import { openUrlThrottled } from '@/shared/utils/openUrl';
import { PropertyDetailsDto } from '@/types/property';

interface UsePropertyContactActionsOptions {
  property: PropertyDetailsDto | null;
  onClose?: () => void;
  onWhatsAppPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

/** Call/WhatsApp/chat handlers for the property details sheet's contact bar. */
export function usePropertyContactActions({
  property,
  onClose,
  onWhatsAppPress,
  onCallPress,
  onChatPress,
}: UsePropertyContactActionsOptions) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const handleWhatsApp = () => {
    if (onWhatsAppPress) {
      onWhatsAppPress();
      return;
    }
    const targetPhone =
      property?.phoneNumber || property?.phone || '96512345678';
    const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
    const waUrl = `whatsapp://send?phone=${cleanPhone}`;
    const webUrl = `https://wa.me/${cleanPhone}`;
    openUrlThrottled(waUrl).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  const handleCall = () => {
    if (onCallPress) {
      onCallPress();
      return;
    }
    const targetPhone = property?.phoneNumber || property?.phone;
    if (!targetPhone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
    openUrlThrottled(`tel:${cleanPhone}`).catch(() => {
      showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
      return;
    }
    if (!property?.id || !property?.host?.id) return;

    if (!token) {
      showAlert('تنبيه', 'يجب تسجيل الدخول لبدء محادثة');
      return;
    }

    onClose?.();
    // Opens the chat at once; the chat screen creates the conversation
    openChatWith(router, {
      recipientId: property.host.id,
      propertyId: property.id,
    });
  };

  return { handleWhatsApp, handleCall, handleChat };
}
