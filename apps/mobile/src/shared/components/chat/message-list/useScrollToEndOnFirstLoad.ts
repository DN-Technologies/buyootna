import { FlashListRef } from '@shopify/flash-list';
import { useEffect, useRef } from 'react';

/**
 * Land on the newest message once the history first arrives. The list stays
 * mounted (it's never swapped for the spinner), and the explicit scroll
 * doesn't rely on FlashList 2.0.2's initial bottom positioning, which left
 * reopened short chats blank (QA).
 */
export function useScrollToEndOnFirstLoad(
  messageCount: number,
  listRef: React.RefObject<FlashListRef<any> | null>,
) {
  const hasScrolledToEnd = useRef(false);
  useEffect(() => {
    if (hasScrolledToEnd.current || messageCount === 0) return;
    hasScrolledToEnd.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [messageCount, listRef]);
}
