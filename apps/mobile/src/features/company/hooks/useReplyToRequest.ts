import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';

import type { CompanyRequestItem } from '../components/requests/types';

/**
 * "الرد" / "ارسال عرض" on a request card: opens a chat with the client and
 * marks the request as answered.
 */
export function useReplyToRequest() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async (request: CompanyRequestItem) => {
    try {
      const conversation = await chatService.createConversation(
        request.clientIdentityId,
      );
      await companyRequestsService.markResponded(request.id);
      queryClient.invalidateQueries({ queryKey: ['companyRequests'] });
      router.push(`/chat/${conversation.id}` as any);
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join('\n')
        : backendMsg || 'تعذر بدء المحادثة مع العميل';
      showAlert('تنبيه', msg);
    }
  };
}
