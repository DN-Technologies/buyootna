import { useEffect, useState } from 'react';

import { chatService } from '@/shared/api/chat.service';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface UseChatSearchOptions {
  conversationId: string;
  messages: { id: string }[];
  hasOlderMessages: boolean;
  loadOlder: () => void;
}

/**
 * Search inside one chat: the server finds the matches (newest first); ↑ / ↓
 * walk them. A match not loaded yet pulls in older pages until it is, then
 * `focusId` asks the list to scroll to it and highlight it.
 */
export function useChatSearch({
  conversationId,
  messages,
  hasOlderMessages,
  loadOlder,
}: UseChatSearchOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState(0);
  const q = useDebounce(query.trim(), 300);

  const [matches, setMatches] = useState<{ id: string }[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isOpen || !conversationId || !q) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    setIsFetching(true);
    chatService
      .searchMessages(conversationId, q)
      .then((found) => !cancelled && setMatches(found))
      .catch(() => !cancelled && setMatches([]))
      .finally(() => !cancelled && setIsFetching(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, conversationId, q]);

  // A new query starts from the newest match
  useEffect(() => setPosition(0), [q]);

  const current = q ? matches[position] : undefined;
  const isLoaded = !!current && messages.some((m) => m.id === current.id);

  // Bring the match into the list: load older pages until it's there
  useEffect(() => {
    if (current && !isLoaded && hasOlderMessages) loadOlder();
  }, [current, isLoaded, hasOlderMessages, loadOlder, messages.length]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => {
      setIsOpen(false);
      setQuery('');
    },
    query,
    setQuery,
    total: q ? matches.length : 0,
    // 1-based for "2 / 7"
    position: matches.length ? position + 1 : 0,
    isSearching: isFetching,
    // ↑ older, ↓ newer
    older: () => setPosition((p) => Math.min(p + 1, matches.length - 1)),
    newer: () => setPosition((p) => Math.max(p - 1, 0)),
    focusId: isLoaded ? current!.id : null,
  };
}
