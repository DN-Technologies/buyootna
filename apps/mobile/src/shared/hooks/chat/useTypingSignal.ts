import { useEffect, useRef } from 'react';

import { socketService } from '@/shared/services/socket.service';

// While typing, "still typing" is re-sent at most this often
const RESEND_MS = 3000;
// No keystroke for this long counts as stopped
const IDLE_MS = 4000;

/**
 * Tells the other person when I am typing in a conversation: on while the
 * draft changes, off when it is emptied (sent or cleared), after a pause,
 * or when the screen closes.
 */
export function useTypingSignal(conversationId: string, draft: string) {
  const isTypingRef = useRef(false);
  const lastSentRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const stop = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socketService.emitTyping(conversationId, false);
      }
    };

    if (!draft.trim()) {
      stop();
      return;
    }

    const now = Date.now();
    if (!isTypingRef.current || now - lastSentRef.current >= RESEND_MS) {
      isTypingRef.current = true;
      lastSentRef.current = now;
      socketService.emitTyping(conversationId, true);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stop, IDLE_MS);
  }, [conversationId, draft]);

  // Leaving the chat ends it at once
  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (isTypingRef.current && conversationId) {
        isTypingRef.current = false;
        socketService.emitTyping(conversationId, false);
      }
    },
    [conversationId],
  );
}
