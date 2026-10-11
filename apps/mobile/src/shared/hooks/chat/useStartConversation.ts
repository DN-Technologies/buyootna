import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

interface UseStartConversationParams {
  // Only set when the screen was opened as /chat/new
  recipientId?: string;
  propertyId?: string;
  // The quote request the chat is about
  requestId?: string;
}

/**
 * Creates (or finds) the conversation for a chat screen opened before it
 * had an id. Runs once per screen; on failure explains why and goes back.
 */
export function useStartConversation({
  recipientId,
  propertyId,
  requestId,
}: UseStartConversationParams) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!recipientId || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    chatService
      .createConversation(recipientId, propertyId, requestId)
      .then(({ id }) => {
        if (cancelled) return;
        setConversationId(id);
        // The route becomes /chat/<id>, as if it had been opened with it
        router.setParams({ id });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to start chat conversation:', error);
        const backendMsg = error?.response?.data?.message;
        const msg = Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'تعذر بدء المحادثة';
        showAlert('تنبيه', msg);
        router.back();
      });

    return () => {
      cancelled = true;
    };
    // Module-level router: stable, so re-renders never cancel the request
  }, [recipientId, propertyId, requestId]);

  return { conversationId, isStarting: !!recipientId && !conversationId };
}
