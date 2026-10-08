import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { notificationsService } from '@/shared/api/notifications.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Sets the number on the app icon to what's unread on the server (chat
 * messages for the current persona + notifications). Best effort.
 */
export async function syncAppBadge(): Promise<void> {
  try {
    if (!useAuthStore.getState().token) {
      await Notifications.setBadgeCountAsync(0);
      return;
    }
    await Notifications.setBadgeCountAsync(await notificationsService.getBadge());
  } catch (e) {
    console.warn('App badge sync failed:', e);
  }
}

/** Several changes close together (reading a few chats) sync once. */
export function scheduleAppBadgeSync(delayMs = 800) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncAppBadge();
  }, delayMs);
}

/**
 * Keeps the app-icon number right: when signing in / out or switching
 * persona, when the app comes forward or goes to the background (the number
 * people see on the home screen), and when unread chat counts change.
 * Pushes carry the number too, so it also grows while the app is closed.
 */
export function useAppBadge(authToken: string | null) {
  const identityId = useAuthStore((state) => state.activeIdentity?.id);

  useEffect(() => {
    void syncAppBadge();
  }, [authToken, identityId]);

  useEffect(() => {
    if (!authToken) return;
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active' || state === 'background') void syncAppBadge();
    });
    // Unread chats went up (a message arrived) or down (a chat was read)
    const unreadTotal = () =>
      useChatStore
        .getState()
        .conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    let last = unreadTotal();
    const unsubscribe = useChatStore.subscribe(() => {
      const next = unreadTotal();
      if (next !== last) {
        last = next;
        scheduleAppBadgeSync();
      }
    });
    return () => {
      appState.remove();
      unsubscribe();
    };
  }, [authToken]);
}
