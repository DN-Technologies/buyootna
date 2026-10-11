import { useCallback, useState } from 'react';

/**
 * Pull-to-refresh state for a list. The spinner follows the user's pull
 * only: binding `refreshing` to a store's loading flag also showed it for
 * background reloads (e.g. on returning to the chats list), and iOS's
 * refresh control could then stay stuck on screen (QA).
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { refreshing, onRefresh };
}
