import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';

interface RequestRef {
  id: string;
  clientIdentityId: string;
}

interface OpenOptions {
  // الرد / ارسال عرض: the request counts as answered once the chat exists
  markResponded?: boolean;
}

/**
 * Opens the chat pinned to a request (الرد, ارسال عرض, ابدأ المحادثة, the
 * chat button on the details). The chat opens as soon as the conversation
 * exists; marking the request answered runs after, in the background, so
 * the tap waits on one call, not two. `openingId` is the request being
 * opened, for the button's spinner; taps while one opens are ignored.
 */
export function useOpenRequestChat() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openingId, setOpeningId] = useState<string | null>(null);
  // A ref as well: a second tap in the same frame sees the first one
  const busy = useRef(false);

  const openChat = async (request: RequestRef, options: OpenOptions = {}) => {
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
      if (options.markResponded) {
        companyRequestsService
          .markResponded(request.id)
          .then(() => {
            // The lists and this request's details show the new status
            queryClient.invalidateQueries({ queryKey: ['companyRequests'] });
            queryClient.invalidateQueries({
              queryKey: ['companyRequest', request.id],
            });
          })
          .catch(() => {
            // The chat is open; the status catches up on the next refresh
          });
      }
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
