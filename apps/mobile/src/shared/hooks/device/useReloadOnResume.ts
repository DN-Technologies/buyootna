import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { socketService } from '@/shared/services/socket.service';

/**
 * Runs `reload` when the app comes back to the foreground or the chat socket
 * reconnects -- whatever arrived meanwhile only came as pushes.
 */
export function useReloadOnResume(reload: () => void) {
  const latest = useRef(reload);
  latest.current = reload;

  useEffect(() => {
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') latest.current();
    });
    const unsubscribe = socketService.onReconnect(() => latest.current());
    return () => {
      appState.remove();
      unsubscribe();
    };
  }, []);
}
