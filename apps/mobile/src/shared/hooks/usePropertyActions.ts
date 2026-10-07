import { useRouter } from 'expo-router';
import { Linking, Share } from 'react-native';

import { normalizeKuwaitPhone } from '@/shared/hooks/useProfileContact';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { adContactPhone, hostHasWhatsapp } from '@/shared/utils/helpers/contact';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';
import { openChatWith } from '@/shared/utils/openChat';
import { openUrlThrottled } from '@/shared/utils/openUrl';
import { PropertyDetailsDto } from '@/types/property';

interface UsePropertyActionsOptions {
  property?: PropertyDetailsDto | null;
  guardAction: (action: () => void | Promise<void>) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
}

export function usePropertyActions({
  property,
  guardAction,
  toggleFavorite,
}: UsePropertyActionsOptions) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleWhatsapp = () => {
    const phone = adContactPhone(property);
    if (!phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    const cleaned = normalizeKuwaitPhone(phone);
    const url = `whatsapp://send?phone=${cleaned}`;

    openUrlThrottled(url).catch(() => {
      const webUrl = `https://wa.me/${cleaned}`;
      Linking.openURL(webUrl).catch(() => {
        showAlert('خطأ', 'تعذر فتح تطبيق الواتساب');
      });
    });
  };

  const handleCall = () => {
    const phone = adContactPhone(property);
    if (!phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    const cleaned = phone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned}`;

    openUrlThrottled(url).catch(() => {
      showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (!property) return;

    guardAction(() => {
      const hostId = property.host?.id;
      if (hostId && user && user.id === hostId) {
        showAlert('تنبيه', 'لا يمكنك بدء محادثة مع نفسك، هذا الإعلان خاص بك.');
        return;
      }
      if (!hostId) {
        showAlert('تنبيه', 'تعذر بدء المحادثة، بيانات المعلن غير متاحة حالياً');
        return;
      }
      // Opens the chat at once; the chat screen creates the conversation
      openChatWith(router, { recipientId: hostId, propertyId: property.id });
    });
  };

  const handleShare = async () => {
    if (!property) return;
    const displayTitle = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`;
    try {
      await Share.share({
        title: displayTitle,
        message: `شاهد هذا العقار على بيوتنا:\n${displayTitle}\nالسعر: ${property.price} د.ك\nالموقع: ${property.location}\nالرابط: https://buyootna.cloud/property/${property.id}`,
      });
    } catch (error) {
      console.error('Error sharing property:', error);
    }
  };

  const handleFavoriteToggle = () => {
    if (!property) return;
    guardAction(async () => {
      await toggleFavorite(property.id);
    });
  };

  const handleHostPress = () => {
    const hostId = property?.host?.id;
    if (!hostId) return;
    if (
      property?.host?.role === 'COMPANY' ||
      property?.host?.role === 'OFFICE'
    ) {
      router.push(`/company/${hostId}`);
    } else {
      router.push(`/profile/${hostId}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    // Companies and offices have no WhatsApp
    canWhatsapp: hostHasWhatsapp(property?.host?.role),
    handleWhatsapp,
    handleCall,
    handleChat,
    handleShare,
    handleFavoriteToggle,
    handleHostPress,
    handleBack,
  };
}
