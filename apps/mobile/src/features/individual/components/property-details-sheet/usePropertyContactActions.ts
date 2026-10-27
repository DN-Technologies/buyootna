import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { adContactPhone, canUseWhatsapp } from '@/shared/utils/helpers/contact';
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
  const viewerType = useAuthStore((state) => state.activeIdentity?.type);

  const handleWhatsApp = () => {
    if (onWhatsAppPress) {
      onWhatsAppPress();
      return;
    }
    const targetPhone = adContactPhone(property);
    if (!targetPhone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
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
    const targetPhone = adContactPhone(property);
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

  return {
    // Only between individuals: not to a company or office, nor from one
    canWhatsApp: canUseWhatsapp(viewerType, property?.host?.role),
    handleWhatsApp,
    handleCall,
    handleChat,
  };
}
