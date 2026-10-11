import { useQuery } from '@tanstack/react-query';

import { chatService } from '@/shared/api/chat.service';
import { useDebounce } from '@/shared/hooks/device/useDebounce';

/**
 * Chats list search on the server: the other person's name, the ad title
 * ("عمارة للبيع"), or text in any message -- across every chat, not only the
 * page already loaded.
 */
export function useConversationSearch(query: string) {
  const q = useDebounce(query.trim(), 300);
  const result = useQuery({
    queryKey: ['chat', 'conversation-search', q],
    queryFn: () => chatService.getConversations(1, 30, q),
    enabled: q.length > 0,
    staleTime: 10_000,
  });
  return {
    results: q ? (result.data?.data ?? []) : [],
    isSearching: !!q && result.isFetching,
  };
}
