import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

interface RequestRef {
  id: string;
  clientIdentityId: string;
}

/**
 * Opens the chat pinned to a request (الرد, ارسال عرض, ابدأ المحادثة, the
 * chat button on the details), as soon as the conversation exists. Opening
 * a chat doesn't mark the request answered: only sending the reply sheet
 * does (تم الرد is the company's own, from its reply). `openingId` is the
 * request being opened, for the button's spinner; taps while one opens are
 * ignored.
 */
export function useOpenRequestChat() {
  const router = useRouter();
  const [openingId, setOpeningId] = useState<string | null>(null);
  // A ref as well: a second tap in the same frame sees the first one
  const busy = useRef(false);

  const openChat = async (request: RequestRef) => {
    if (busy.current) return;
    busy.current = true;
    setOpeningId(request.id);
    try {
      const conversation = await chatService.createConversation(
        request.clientIdentityId,
        undefined,
        // The chat is about this request: both sides see it pinned
        request.id,
      );
      router.push(`/chat/${conversation.id}` as never);
    } catch (error: any) {
      if (handleSubscriptionRequired(error, router)) return;
      const backendMsg = error?.response?.data?.message;
      showAlert(
        'تنبيه',
        Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'تعذر بدء المحادثة مع العميل',
      );
    } finally {
      busy.current = false;
      setOpeningId(null);
    }
  };

  return { openChat, openingId };
}
