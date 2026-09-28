import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { UserProfile } from '@/shared/components/profile/types';
import { showAlert } from '@/shared/utils/alert';
import { openChatWith } from '@/shared/utils/openChat';
import { openUrlThrottled } from '@/shared/utils/openUrl';

export function normalizeKuwaitPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (
    cleaned.length === 8 &&
    !cleaned.startsWith('+') &&
    !cleaned.startsWith('965')
  ) {
    cleaned = `965${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function useProfileContact(userProfile?: UserProfile) {
  const router = useRouter();

  const handleWhatsapp = () => {
    if (!userProfile?.phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح');
      return;
    }
    const cleaned = normalizeKuwaitPhone(userProfile.phone);
    const url = `whatsapp://send?phone=${cleaned}`;

    openUrlThrottled(url).catch(() => {
      Linking.openURL(`https://wa.me/${cleaned}`).catch(() => {
        showAlert('خطأ', 'تعذر فتح تطبيق الواتساب');
      });
    });
  };

  const handleCall = () => {
    if (!userProfile?.phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح');
      return;
    }
    const cleaned = userProfile.phone.replace(/[^0-9+]/g, '');
    openUrlThrottled(`tel:${cleaned}`).catch(() => {
      showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (!userProfile) return;

    // Opens the chat at once; the chat screen creates the conversation
    openChatWith(router, { recipientId: userProfile.id });
  };

  return {
    handleWhatsapp,
    handleCall,
    handleChat,
  };
}
