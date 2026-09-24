import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { chatService } from '@/shared/api/chat.service';
import { useSingleFlight } from '@/shared/hooks/useSingleFlight';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
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
  const runOnce = useSingleFlight();

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

    // Single-flight: a rapid double-tap must not fire createConversation
    // twice (duplicate conversation + a second, different chat screen).
    runOnce(async () => {
      try {
        const response = await chatService.createConversation(
          property.host.id,
          property.id,
        );
        onClose?.();
        router.push(`/chat/${response.id}`);
      } catch (error: any) {
        console.error('Failed to start chat conversation:', error);
        const backendMsg = error?.response?.data?.message;
        const msg = Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'تعذر بدء المحادثة مع البائع';
        showAlert('تنبيه', msg);
      }
    });
  };

  return { handleWhatsApp, handleCall, handleChat };
}
