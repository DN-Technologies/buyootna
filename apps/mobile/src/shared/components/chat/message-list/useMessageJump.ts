import { FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { DisplayMessage } from '@/shared/utils/chatDate';

// How long a message stays tinted after jumping to it from a quote
const HIGHLIGHT_MS = 1200;

/**
 * Jumping to a message (tapping its quote, or moving to another in-chat
 * search match): scrolls to it and tints it for a moment.
 */
export function useMessageJump(
  messages: DisplayMessage[],
  listRef: React.RefObject<FlashListRef<any> | null>,
  focusMessageId?: string | null,
) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const jumpTo = useCallback(
    (messageId: string) => {
      const index = messages.findIndex((m) => m.id === messageId);
      if (index < 0) return;
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedId(messageId);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(
        () => setHighlightedId(null),
        HIGHLIGHT_MS,
      );
    },
    [messages, listRef],
  );

  // In-chat search moved to another match
  useEffect(() => {
    if (focusMessageId) jumpTo(focusMessageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMessageId]);

  return { highlightedId, jumpTo };
}
